"""
Rate limiting configuration and utilities
"""
import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI
from slowapi.middleware import SlowAPIMiddleware

# Initialize limiter
limiter = Limiter(key_func=get_remote_address)

def setup_rate_limiting(app: FastAPI):
    """Setup rate limiting middleware and handlers"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

async def _rate_limit_exceeded_handler(request, exc):
    """Custom handler for rate limit exceeded errors"""
    return {
        "detail": f"Rate limit exceeded. Try again after {exc.detail.split('calls in ')[-1] if 'calls in' in exc.detail else '1 minute'}"
    }

# Rate limit definitions (can be customized per endpoint)
RATE_LIMITS = {
    "auth": "20/minute",          # Auth endpoints
    "upload": "10/minute",        # File uploads
    "chat": "30/minute",          # Chat messages
    "analysis": "15/minute",      # Heavy analysis endpoints
    "default": "100/minute",      # Default for other endpoints
}

def get_rate_limit(endpoint_type: str = "default") -> str:
    """Get rate limit for endpoint type"""
    return RATE_LIMITS.get(endpoint_type, RATE_LIMITS["default"])
