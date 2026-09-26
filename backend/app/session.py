import uuid
import logging
from typing import Optional, Dict, Any
from fastapi import Request
from sqlalchemy.orm import Session
from backend.app.models import SessionState

logger = logging.getLogger(__name__)

def get_session_id_from_request(request: Request) -> str:
    """Extract X-Session-ID header or query param from FastAPI request, or generate a fallback."""
    session_id = request.headers.get("X-Session-ID") or request.query_params.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
        logger.debug(f"Generated new session ID: {session_id}")
    return session_id

def get_or_create_session(db: Session, session_id: Optional[str] = None) -> SessionState:
    """Retrieve existing SessionState or create a new one in DB."""
    if not session_id:
        session_id = str(uuid.uuid4())

    session_obj = db.query(SessionState).filter(SessionState.id == session_id).first()
    if not session_obj:
        session_obj = SessionState(
            id=session_id,
            resume_data=None,
            job_data=None,
            match_data=None,
            roadmap_data=None,
            interview_data=None,
            context_data={}
        )
        db.add(session_obj)
        db.commit()
        db.refresh(session_obj)
        logger.info(f"Created new session state: {session_id}")
    return session_obj

def update_session_resume(db: Session, session_id: str, resume_data: Dict[str, Any], resume_id: Optional[str] = None) -> SessionState:
    """Update session with resume analysis results."""
    session_obj = get_or_create_session(db, session_id)
    session_obj.resume_data = resume_data
    if resume_id:
        session_obj.active_resume_id = resume_id
    db.commit()
    db.refresh(session_obj)
    return session_obj

def update_session_job(db: Session, session_id: str, job_data: Dict[str, Any], job_id: Optional[str] = None) -> SessionState:
    """Update session with target job description requirements."""
    session_obj = get_or_create_session(db, session_id)
    session_obj.job_data = job_data
    if job_id:
        session_obj.active_job_id = job_id
    db.commit()
    db.refresh(session_obj)
    return session_obj

def update_session_match(db: Session, session_id: str, match_data: Dict[str, Any]) -> SessionState:
    """Update session with job match calculations and missing skill gaps."""
    session_obj = get_or_create_session(db, session_id)
    session_obj.match_data = match_data
    db.commit()
    db.refresh(session_obj)
    return session_obj

def update_session_roadmap(db: Session, session_id: str, roadmap_data: Dict[str, Any]) -> SessionState:
    """Update session with learning roadmap data."""
    session_obj = get_or_create_session(db, session_id)
    session_obj.roadmap_data = roadmap_data
    db.commit()
    db.refresh(session_obj)
    return session_obj

def update_session_interview(db: Session, session_id: str, interview_data: Dict[str, Any]) -> SessionState:
    """Update session with mock interview scores and feedback."""
    session_obj = get_or_create_session(db, session_id)
    session_obj.interview_data = interview_data
    db.commit()
    db.refresh(session_obj)
    return session_obj
