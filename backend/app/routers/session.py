import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.session import get_or_create_session, get_session_id_from_request
from backend.app.models import SessionState

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/session", tags=["Session"])

@router.post("/create")
def create_session(db: Session = Depends(get_db)):
    """Create a new temporary session and return its ID."""
    session_id = str(uuid.uuid4())
    session_obj = get_or_create_session(db, session_id)
    return {
        "status": "success",
        "session_id": session_obj.id,
        "message": "Session initialized successfully."
    }

@router.get("/{session_id}")
def get_session_details(session_id: str, db: Session = Depends(get_db)):
    """Get full state for a given session."""
    session_obj = db.query(SessionState).filter(SessionState.id == session_id).first()
    if not session_obj:
        # Auto-create if not found to provide smooth user flow
        session_obj = get_or_create_session(db, session_id)
        
    return {
        "session_id": session_obj.id,
        "created_at": session_obj.created_at,
        "updated_at": session_obj.updated_at,
        "resume": session_obj.resume_data,
        "job": session_obj.job_data,
        "match": session_obj.match_data,
        "roadmap": session_obj.roadmap_data,
        "interview": session_obj.interview_data,
        "context": session_obj.context_data
    }

@router.delete("/{session_id}")
def clear_session(session_id: str, db: Session = Depends(get_db)):
    """Clear state data for a session."""
    session_obj = db.query(SessionState).filter(SessionState.id == session_id).first()
    if session_obj:
        db.delete(session_obj)
        db.commit()
    return {"status": "success", "message": f"Session {session_id} deleted."}
