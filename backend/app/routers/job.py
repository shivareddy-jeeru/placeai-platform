from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from backend.app import schemas
from backend.app.agents.job_agent import JobAgent

router = APIRouter(prefix="/job", tags=["job"])
job_agent = JobAgent()


@router.post("/analyze", response_model=schemas.JobDescriptionOut, status_code=201)
def analyze_job(
    payload: schemas.JobDescriptionCreate,
):
    """Analyze a job description and store it against the authenticated user."""
    analysis = job_agent.run({"jd_text": payload.raw_text})
    if "error" in analysis:
        raise HTTPException(status_code=500, detail="Job analysis failed. Please try again.")

    db_jd = models.JobDescription(
        user_id=current_user.id,
        title=analysis.get("title") or payload.title or "Software Engineer",
        company=analysis.get("company") or payload.company or "Confidential",
        raw_text=payload.raw_text,
        extracted_skills=list(set(
            analysis.get("mandatory_skills", []) + analysis.get("optional_skills", [])
        )),
        requirements=analysis.get("requirements", {}),
    )
    db.add(db_jd)
    db.commit()
    db.refresh(db_jd)
    return db_jd


@router.get("", response_model=List[schemas.JobDescriptionOut])
def list_jobs(
):
    """List all job descriptions belonging to the authenticated user."""
    return (
        db.query(models.JobDescription)
        .filter(models.JobDescription.user_id == current_user.id)
        .order_by(models.JobDescription.created_at.desc())
        .all()
    )


@router.get("/{job_id}", response_model=schemas.JobDescriptionOut)
def get_job(
    job_id: str,
):
    """Get a specific job description owned by the authenticated user."""
    job = (
        db.query(models.JobDescription)
        .filter(
            models.JobDescription.id == job_id,
            models.JobDescription.user_id == current_user.id,
        )
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")
    return job
