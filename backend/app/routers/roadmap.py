from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.learning_agent import LearningAgent
from backend.app.security import get_current_user

router = APIRouter(prefix="/roadmap", tags=["roadmap"])
learning_agent = LearningAgent()


@router.post("/generate", response_model=schemas.RoadmapOut, status_code=201)
def generate_roadmap(
    payload: schemas.RoadmapCreateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate a personalized learning roadmap from the user's actual skill gaps."""
    current_skills = list(payload.current_skills or [])
    missing_skills = list(payload.missing_skills or [])

    # If a job ID is provided as the source, compute real gaps from DB
    if payload.skill_gap_source:
        job = (
            db.query(models.JobDescription)
            .filter(
                models.JobDescription.id == payload.skill_gap_source,
                models.JobDescription.user_id == current_user.id,
            )
            .first()
        )
        if job:
            latest_resume = (
                db.query(models.Resume)
                .filter(models.Resume.user_id == current_user.id)
                .order_by(models.Resume.created_at.desc())
                .first()
            )
            job_skills = {s.lower() for s in (job.extracted_skills or [])}
            resume_skills = {s.lower() for s in (latest_resume.extracted_skills or [])} if latest_resume else set()
            missing_skills = list(job_skills - resume_skills)
            if latest_resume:
                current_skills = latest_resume.extracted_skills or []

    roadmap = learning_agent.run({
        "target_role": payload.target_role,
        "current_skills": current_skills,
        "missing_skills": missing_skills,
    })
    if "error" in roadmap:
        raise HTTPException(status_code=500, detail="Roadmap generation failed. Please try again.")

    db_roadmap = models.LearningRoadmap(
        user_id=current_user.id,
        target_role=payload.target_role,
        roadmap_data=roadmap,
        completed_tasks=[],
    )
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)
    return db_roadmap


@router.get("", response_model=List[schemas.RoadmapOut])
def list_roadmaps(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.LearningRoadmap)
        .filter(models.LearningRoadmap.user_id == current_user.id)
        .order_by(models.LearningRoadmap.created_at.desc())
        .all()
    )


@router.patch("/progress", response_model=schemas.RoadmapOut)
def update_roadmap_progress(
    payload: schemas.UpdateRoadmapProgressRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update completed tasks. Frontend cannot override the roadmap content — only mark tasks done."""
    roadmap = (
        db.query(models.LearningRoadmap)
        .filter(models.LearningRoadmap.user_id == current_user.id)
        .order_by(models.LearningRoadmap.created_at.desc())
        .first()
    )
    if not roadmap:
        raise HTTPException(status_code=404, detail="No active roadmap found. Please generate one first.")

    roadmap.completed_tasks = payload.completed_tasks
    db.commit()
    db.refresh(roadmap)
    return roadmap
