from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.database import get_db
from backend.app import models
from backend.app.security import get_current_user_optional
from backend.app.session import get_session_id_from_request, get_or_create_session

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("/gaps")
def get_skill_gaps(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """Retrieve list of missing skills strictly isolated for the current student."""
    user_id = current_user.id if current_user else None

    # 1. Query latest match for authenticated student
    if user_id:
        latest_match = db.query(models.ResumeMatch).filter(
            models.ResumeMatch.user_id == user_id
        ).order_by(models.ResumeMatch.created_at.desc()).first()
        if latest_match and latest_match.missing_skills:
            return {"missing_skills": latest_match.missing_skills}

    # 2. Query latest match by session_id
    latest_match = db.query(models.ResumeMatch).filter(
        models.ResumeMatch.session_id == session_id
    ).order_by(models.ResumeMatch.created_at.desc()).first()
    if latest_match and latest_match.missing_skills:
        return {"missing_skills": latest_match.missing_skills}

    # 3. Dynamic benchmark comparison if resume exists
    resume_query = models.Resume.user_id == user_id if user_id else models.Resume.session_id == session_id
    latest_resume = db.query(models.Resume).filter(resume_query).order_by(models.Resume.created_at.desc()).first()
    if latest_resume and latest_resume.extracted_skills:
        extracted = set([s.lower() for s in latest_resume.extracted_skills])
        benchmarks = ["Docker & Containers", "Kubernetes", "Redis Caching", "System Design & Distributed Scalability", "CI/CD & DevOps"]
        missing = [b for b in benchmarks if not any(b.lower() in s or s in b.lower() for s in extracted)]
        return {"missing_skills": missing if missing else ["System Design", "Docker & Containers"]}

    return {"missing_skills": ["Docker & Containers", "System Design", "SQL Database Optimization"]}
