import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.security import get_current_user
from backend.app.services.ats_scorer import ats_scorer

router = APIRouter(prefix="/matching", tags=["matching"])
logger = logging.getLogger(__name__)


def run_matching_engine(resume: models.Resume, job: models.JobDescription) -> dict:
    """Deterministic skill-based job match engine. Score is never set by the client."""
    resume_skills_str = " ".join(resume.extracted_skills or [])
    resume_text = (
        f"Skills: {resume_skills_str}\n"
        f"Experience: {resume.experience or []}\n"
        f"Projects: {resume.projects or []}"
    )
    job_text = job.raw_text or ""
    jd_eval = ats_scorer.calculate_job_match_score(resume_text, job_text)

    match_pct = jd_eval["jobMatchScore"] if jd_eval["jobMatchScore"] is not None else 0.0
    bd = jd_eval.get("breakdown") or {}

    return {
        "match_percentage": match_pct,
        "skill_score": bd.get("required_skills", 0.0),
        "experience_score": bd.get("experience_relevance", 0.0),
        "keyword_score": bd.get("technical_keywords", 0.0),
        "semantic_score": bd.get("title_relevance", 0.0),
        "missing_skills": jd_eval["missingSkills"],
        "recommendations": jd_eval["recommendations"],
    }


@router.post("/match", response_model=schemas.MatchOut, status_code=201)
def match_resume_to_job(
    payload: schemas.MatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Match a resume against a job description. Both must be owned by the authenticated user.
    Returns 403 if the user tries to access another user's data.
    """
    resume = (
        db.query(models.Resume)
        .filter(models.Resume.id == payload.resume_id, models.Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    job = (
        db.query(models.JobDescription)
        .filter(models.JobDescription.id == payload.job_id, models.JobDescription.user_id == current_user.id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    # Return existing match if already computed (idempotent)
    existing = (
        db.query(models.ResumeMatch)
        .filter(
            models.ResumeMatch.resume_id == payload.resume_id,
            models.ResumeMatch.job_id == payload.job_id,
        )
        .first()
    )
    if existing:
        return existing

    result = run_matching_engine(resume, job)

    db_match = models.ResumeMatch(
        resume_id=payload.resume_id,
        job_id=payload.job_id,
        match_percentage=result["match_percentage"],
        skill_score=result["skill_score"],
        experience_score=result["experience_score"],
        keyword_score=result["keyword_score"],
        semantic_score=result["semantic_score"],
        missing_skills=result["missing_skills"],
        recommendations=result["recommendations"],
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match


@router.get("", response_model=List[schemas.MatchOut])
def list_matches(
    job_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all matches for the authenticated user's resumes."""
    query = (
        db.query(models.ResumeMatch)
        .join(models.Resume, models.ResumeMatch.resume_id == models.Resume.id)
        .filter(models.Resume.user_id == current_user.id)
    )
    if job_id:
        query = query.filter(models.ResumeMatch.job_id == job_id)
    return query.order_by(models.ResumeMatch.created_at.desc()).all()


@router.get("/{match_id}", response_model=schemas.MatchOut)
def get_match(
    match_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get a specific match result, enforcing ownership through the related resume."""
    match = (
        db.query(models.ResumeMatch)
        .join(models.Resume, models.ResumeMatch.resume_id == models.Resume.id)
        .filter(models.ResumeMatch.id == match_id, models.Resume.user_id == current_user.id)
        .first()
    )
    if not match:
        raise HTTPException(status_code=404, detail="Match result not found.")
    return match
