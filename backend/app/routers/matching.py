import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.security import get_current_user_optional
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_match
from backend.app.services.ats_scorer import ats_scorer

router = APIRouter(prefix="/matching", tags=["matching"])
logger = logging.getLogger(__name__)

def run_matching_engine(resume: models.Resume, job: models.JobDescription) -> dict:
    """Invokes deterministic ATS Scorer for Job Match and produces explainable metrics."""
    resume_skills_str = " ".join(resume.extracted_skills or [])
    resume_text = f"Skills: {resume_skills_str}\nExperience: {resume.experience or []}\nProjects: {resume.projects or []}"
    job_text = job.raw_text or ""

    jd_eval = ats_scorer.calculate_job_match_score(resume_text, job_text)
    
    match_pct = jd_eval["jobMatchScore"] if jd_eval["jobMatchScore"] is not None else 75.0
    bd = jd_eval["breakdown"] or {}
    
    missing_skills = jd_eval["missingSkills"]
    recs = jd_eval["recommendations"]

    return {
        "match_percentage": match_pct,
        "skill_score": bd.get("required_skills", 30.0) * (100.0 / 40.0),
        "experience_score": bd.get("experience_relevance", 12.0) * (100.0 / 15.0),
        "keyword_score": bd.get("technical_keywords", 20.0) * (100.0 / 25.0),
        "semantic_score": bd.get("role_relevance", 16.0) * (100.0 / 20.0),
        "missing_skills": missing_skills,
        "recommendations": recs
    }

@router.post("/match", response_model=schemas.MatchOut, status_code=status.HTTP_201_CREATED)
def match_resume_to_job(
    payload: schemas.MatchRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    user_id = current_user.id if current_user else None

    # Verify resume belongs to user or session
    if user_id:
        resume = db.query(models.Resume).filter(
            models.Resume.id == payload.resume_id,
            models.Resume.user_id == user_id
        ).first()
    else:
        resume = db.query(models.Resume).filter(
            models.Resume.id == payload.resume_id,
            models.Resume.session_id == session_id
        ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or unauthorized.")

    # Verify job description belongs to user or session
    if user_id:
        job = db.query(models.JobDescription).filter(
            models.JobDescription.id == payload.job_id,
            models.JobDescription.user_id == user_id
        ).first()
    else:
        job = db.query(models.JobDescription).filter(
            models.JobDescription.id == payload.job_id,
            models.JobDescription.session_id == session_id
        ).first()
    
    if not job:
        # Fallback check: check if it's a global/pre-seeded sample job
        job = db.query(models.JobDescription).filter(models.JobDescription.id == payload.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job Description not found or unauthorized.")

    # Check if match already exists
    existing = db.query(models.ResumeMatch).filter(
        models.ResumeMatch.resume_id == payload.resume_id,
        models.ResumeMatch.job_id == payload.job_id
    ).first()
    
    if existing:
        return existing

    result = run_matching_engine(resume, job)

    db_match = models.ResumeMatch(
        user_id=user_id,
        session_id=session_id,
        resume_id=payload.resume_id,
        job_id=payload.job_id,
        match_percentage=result["match_percentage"],
        skill_score=result["skill_score"],
        experience_score=result["experience_score"],
        keyword_score=result["keyword_score"],
        semantic_score=result["semantic_score"],
        missing_skills=result["missing_skills"],
        recommendations=result["recommendations"]
    )
    
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    update_session_match(db, session_id, result)
    return db_match

@router.get("/{match_id}", response_model=schemas.MatchOut)
def get_match(
    match_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    match = db.query(models.ResumeMatch).filter(models.ResumeMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match metrics not found")

    # Isolation check
    if current_user and match.user_id and match.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to match details.")

    return match

@router.get("", response_model=List[schemas.MatchOut])
def list_matches(
    job_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    if current_user:
        query = db.query(models.ResumeMatch).filter(models.ResumeMatch.user_id == current_user.id)
    else:
        query = db.query(models.ResumeMatch).filter(models.ResumeMatch.session_id == session_id)

    if job_id:
        query = query.filter(models.ResumeMatch.job_id == job_id)
    return query.all()
