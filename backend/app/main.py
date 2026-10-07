import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base
from backend.app.routers import session, resume, job, matching, skills, roadmap, interview, research, chat, dashboard, code, auth
from backend.app.services.rag import rag_service
from backend.app.rate_limiting import setup_rate_limiting

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent career prep system leveraging LangChain and Gemini.",
    version="1.0.0"
)

# CORS configuration — restricted to real frontends only
cors_origins_raw = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://placeai-platform.vercel.app"
)
cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# Payload size validation middleware (10MB limit for resume uploads)
MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10 MB

@app.middleware("http")
async def limit_request_size(request, call_next):
    if request.method in ("POST", "PUT", "PATCH"):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_REQUEST_SIZE:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=413,
                content={"detail": "Request payload too large. Maximum allowed size is 10 MB."}
            )
    return await call_next(request)

# Global safe error handler — never expose tracebacks in production
from fastapi import Request as FastAPIRequest
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: FastAPIRequest, exc: Exception):
    """Catch-all: return a user-safe error without internal details."""
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again later."},
    )

# Setup rate limiting
setup_rate_limiting(app)

# Include sub-routers
app.include_router(session.router, prefix=settings.API_V1_STR)
app.include_router(resume.router, prefix=settings.API_V1_STR)
app.include_router(job.router, prefix=settings.API_V1_STR)
app.include_router(matching.router, prefix=settings.API_V1_STR)
app.include_router(skills.router, prefix=settings.API_V1_STR)
app.include_router(roadmap.router, prefix=settings.API_V1_STR)
app.include_router(interview.router, prefix=settings.API_V1_STR)
app.include_router(research.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(code.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["auth"])


# Health check endpoint (for docker and monitoring)
@app.get("/health")
@app.get("/api/health")
def health_check():
    """Health check endpoint for load balancers and docker"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

def seed_rag_database():
    """Reads default placement guides and loads them into ChromaDB if empty."""
    # Define local path relative to workspace
    workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    guide_path = os.path.join(workspace_root, "data", "default_materials", "placement_guide.txt")
    
    if not os.path.exists(guide_path):
        logger.warning(f"RAG seed file not found at: {guide_path}. Skipping vector DB seeding.")
        return
        
    try:
        with open(guide_path, "r", encoding="utf-8") as f:
            full_text = f.read()
            
        # Quick character splitting (around 800 chars per chunk with 150 chars overlap)
        chunks = []
        chunk_size = 800
        overlap = 150
        
        start = 0
        while start < len(full_text):
            end = min(start + chunk_size, len(full_text))
            chunks.append(full_text[start:end])
            start += chunk_size - overlap
            
        metadatas = [{"source": "placement_guide.txt", "chunk_index": idx} for idx, _ in enumerate(chunks)]
        
        # Ingest into RAGService
        success = rag_service.add_documents(chunks, metadatas)
        if success:
            logger.info(f"RAG database successfully seeded with {len(chunks)} chunks.")
        else:
            logger.warning("RAG database seeding failed.")
    except Exception as e:
        logger.error(f"Error seeding RAG database: {e}")

@app.on_event("startup")
def on_startup():
    logger.info("Initializing database tables...")
    try:
        # Create all tables (safe to run multiple times, won't overwrite existing schema)
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

    logger.info("Seeding vector database...")
    seed_rag_database()

@app.get("/")
def root():
    return {"message": "Welcome to the AI-Powered Placement Assistant API. Refer to /docs for OpenAPI specs."}
