from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.learning_agent import LearningAgent
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_roadmap

router = APIRouter(prefix="/roadmap", tags=["roadmap"])
learning_agent = LearningAgent()

@router.post("/generate", response_model=schemas.RoadmapOut, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    payload: schemas.RoadmapCreateRequest,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    current_skills = payload.current_skills or []
    missing_skills = payload.missing_skills or []
    
    # If a skill_gap_source (job ID) was provided, load missing skills from there
    if payload.skill_gap_source:
        job = db.query(models.JobDescription).filter(
            models.JobDescription.id == payload.skill_gap_source,
            models.JobDescription.session_id == session_id
        ).first()
        if job:
            latest_resume = db.query(models.Resume).filter(
                models.Resume.session_id == session_id
            ).order_by(models.Resume.created_at.desc()).first()
            
            job_skills = set([s.lower() for s in (job.extracted_skills or [])])
            resume_skills = set([s.lower() for s in (latest_resume.extracted_skills or [])]) if latest_resume else set()
            missing_skills = list(job_skills - resume_skills)
            
            if latest_resume:
                current_skills = latest_resume.extracted_skills or []

    # Run the LearningAgent
    roadmap = learning_agent.run({
        "target_role": payload.target_role,
        "current_skills": current_skills,
        "missing_skills": missing_skills
    })
    
    if "error" in roadmap:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Roadmap generator failed: {roadmap['error']}"
        )

    db_roadmap = models.LearningRoadmap(
        session_id=session_id,
        user_id=None,
        target_role=payload.target_role,
        roadmap_data=roadmap
    )
    
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)

    # Update active SessionState
    update_session_roadmap(db, session_id, roadmap)

    return db_roadmap

@router.get("", response_model=List[schemas.RoadmapOut])
def list_roadmaps(
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    roadmaps = db.query(models.LearningRoadmap).filter(models.LearningRoadmap.session_id == session_id).all()
    return roadmaps

@router.patch("/progress", response_model=schemas.RoadmapOut)
def update_roadmap_progress(
    payload: schemas.UpdateRoadmapProgressRequest,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    roadmap = db.query(models.LearningRoadmap).filter(
        models.LearningRoadmap.session_id == session_id
    ).order_by(models.LearningRoadmap.created_at.desc()).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Active roadmap not found in this session.")
        
    roadmap.completed_tasks = payload.completed_tasks
    db.commit()
    db.refresh(roadmap)

    # Sync with SessionState cache
    session_obj = get_or_create_session(db, session_id)
    session_roadmap_data = dict(roadmap.roadmap_data or {})
    # Include completion details if relevant
    session_roadmap_data["completed_tasks"] = payload.completed_tasks
    update_session_roadmap(db, session_id, session_roadmap_data)

    return roadmap

