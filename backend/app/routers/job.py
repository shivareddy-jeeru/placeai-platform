from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.job_agent import JobAgent
from backend.app.security import get_current_user_optional
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_job

router = APIRouter(prefix="/job", tags=["job"])
job_agent = JobAgent()

@router.post("/analyze", response_model=schemas.JobDescriptionOut, status_code=status.HTTP_201_CREATED)
def analyze_job(
    payload: schemas.JobDescriptionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    analysis = job_agent.run({"jd_text": payload.raw_text})
    if "error" in analysis:
        # Fallback to simple skill extraction
        from backend.app.services.ats_scorer import ats_scorer
        detected = ats_scorer.detect_skills(payload.raw_text)
        analysis = {
            "title": payload.title or "Software Engineer",
            "company": payload.company or "Confidential",
            "mandatory_skills": detected[:5],
            "optional_skills": detected[5:],
            "requirements": {}
        }

    user_id = current_user.id if current_user else None

    db_jd = models.JobDescription(
        session_id=session_id,
        user_id=user_id,
        title=analysis.get("title") or payload.title or "Software Engineer",
        company=analysis.get("company") or payload.company or "Confidential",
        raw_text=payload.raw_text,
        extracted_skills=list(set(analysis.get("mandatory_skills", []) + analysis.get("optional_skills", []))),
        requirements=analysis.get("requirements", {})
    )
    
    db.add(db_jd)
    db.commit()
    db.refresh(db_jd)

    update_session_job(db, session_id, analysis, job_id=db_jd.id)
    return db_jd

@router.get("", response_model=List[schemas.JobDescriptionOut])
def list_jobs(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    if current_user:
        return db.query(models.JobDescription).filter(
            (models.JobDescription.user_id == current_user.id) | (models.JobDescription.user_id.is_(None))
        ).all()
    return db.query(models.JobDescription).filter(models.JobDescription.session_id == session_id).all()

@router.get("/{job_id}", response_model=schemas.JobDescriptionOut)
def get_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    job = db.query(models.JobDescription).filter(models.JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")

    if current_user and job.user_id and job.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to job description")

    return job
