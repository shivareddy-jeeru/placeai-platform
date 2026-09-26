"""
Rate limiting configuration and utilities
"""
import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from slowapi.middleware import SlowAPIMiddleware

# Initialize limiter
limiter = Limiter(key_func=get_remote_address)

def setup_rate_limiting(app: FastAPI):
    """Setup rate limiting middleware and handlers"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

async def _rate_limit_exceeded_handler(request, exc):
    """Custom handler for rate limit exceeded errors returning HTTP 429"""
    return JSONResponse(
        status_code=429,
        content={
            "error": f"Too many requests. Try again after {exc.detail.split('calls in ')[-1] if 'calls in' in exc.detail else 'a minute'}."
        }
    )

# Rate limit definitions per endpoint type
RATE_LIMITS = {
    "auth": "20/minute",          # Authentication endpoints
    "upload": "10/minute",        # File uploads
    "workflow": "10/minute",      # Heavy AI workflow & code analysis endpoints
    "analysis": "10/minute",      # Analysis endpoints
    "rag": "15/minute",           # RAG retrieval queries
    "chat": "15/minute",          # AI Chat queries
    "default": "100/minute",      # Default for general endpoints
}

def get_rate_limit(endpoint_type: str = "default") -> str:
    """Get rate limit string for endpoint type"""
    return RATE_LIMITS.get(endpoint_type, RATE_LIMITS["default"])

