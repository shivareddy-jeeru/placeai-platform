import io
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from sqlalchemy.orm import Session
from typing import List

from pypdf import PdfReader
from docx import Document as DocxDocument

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.resume_agent import ResumeAgent
from backend.app.rate_limiting import limiter, get_rate_limit
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_resume

router = APIRouter(prefix="/resume", tags=["resume"])
resume_agent = ResumeAgent()

logger = logging.getLogger(__name__)

def extract_text_from_file(file: UploadFile) -> str:
    content_type = file.content_type
    filename = file.filename or ""
    
    try:
        file.file.seek(0)
        if filename.endswith(".pdf") or content_type == "application/pdf":
            pdf_bytes = file.file.read()
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
            
        elif filename.endswith(".docx") or content_type in [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
        ]:
            docx_bytes = file.file.read()
            doc = DocxDocument(io.BytesIO(docx_bytes))
            text = "\n".join([p.text for p in doc.paragraphs])
            return text
            
        else:
            content = file.file.read()
            return content.decode("utf-8")
    except Exception as e:
        logger.error(f"Error parsing uploaded file {filename}: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not parse resume file: {str(e)}"
        )

@router.post("/analyze", response_model=schemas.ResumeOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_rate_limit("upload"))
def analyze_resume(
    request: Request, file: UploadFile = File(...),
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    # Extract text from file
    text = extract_text_from_file(file)
    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded resume appears to be empty."
        )

    # Process resume using ResumeAgent
    analysis = resume_agent.run({"resume_text": text})
    if "error" in analysis:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume agent failed: {analysis['error']}"
        )

    # Save to database with session_id
    db_resume = models.Resume(
        session_id=session_id,
        user_id=None,
        filename=file.filename or "uploaded_resume",
        extracted_skills=analysis.get("extracted_skills", []),
        education=analysis.get("education", []),
        experience=analysis.get("experience", []),
        projects=analysis.get("projects", []),
        ats_score=float(analysis.get("ats_score", 0.0)),
        improvements=analysis.get("improvements", []),
        strengths=analysis.get("strengths", []),
        faults=analysis.get("faults", []),
        suitable_roles=analysis.get("suitable_roles", []),
        roadmap=analysis.get("roadmap", {})
    )
    
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Update active SessionState
    update_session_resume(db, session_id, analysis, resume_id=db_resume.id)

    return db_resume

@router.get("/analysis", response_model=schemas.ResumeOut)
def get_current_analysis(
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    # Get active session details
    session_obj = get_or_create_session(db, session_id)
    if not session_obj.active_resume_id:
        raise HTTPException(status_code=404, detail="No resume uploaded in this session yet.")

    resume = db.query(models.Resume).filter(
        models.Resume.id == session_obj.active_resume_id,
        models.Resume.session_id == session_id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume analysis details not found.")
    return resume

@router.get("", response_model=List[schemas.ResumeOut])
def list_resumes(
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    resumes = db.query(models.Resume).filter(models.Resume.session_id == session_id).all()
    return resumes

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.session_id == session_id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Clean up from session state if active
    session_obj = get_or_create_session(db, session_id)
    if session_obj.active_resume_id == resume_id:
        session_obj.active_resume_id = None
        session_obj.resume_data = None
        db.commit()

    db.delete(resume)
    db.commit()
    return None


