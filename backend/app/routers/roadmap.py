from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.learning_agent import LearningAgent
from backend.app.security import get_current_user_optional
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_roadmap

router = APIRouter(prefix="/roadmap", tags=["roadmap"])
learning_agent = LearningAgent()

@router.post("/generate", response_model=schemas.RoadmapOut, status_code=status.HTTP_201_CREATED)
def generate_roadmap(
    payload: schemas.RoadmapCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    user_id = current_user.id if current_user else None
    current_skills = payload.current_skills or []
    missing_skills = payload.missing_skills or []
    
    # If a skill_gap_source (job ID) was provided, load missing skills from there
    if payload.skill_gap_source:
        job_query = models.JobDescription.user_id == user_id if user_id else models.JobDescription.session_id == session_id
        job = db.query(models.JobDescription).filter(
            models.JobDescription.id == payload.skill_gap_source,
            job_query
        ).first()
        if not job:
            job = db.query(models.JobDescription).filter(models.JobDescription.id == payload.skill_gap_source).first()

        if job:
            resume_query = models.Resume.user_id == user_id if user_id else models.Resume.session_id == session_id
            latest_resume = db.query(models.Resume).filter(resume_query).order_by(models.Resume.created_at.desc()).first()
            
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
    
    if "error" in roadmap or not roadmap:
        # High quality fallback roadmap structured by actual skill gaps
        phases = [
            {
                "phase_number": 1,
                "title": "Foundation & Target Role Alignment",
                "duration_weeks": 2,
                "milestones": [f"Review core fundamentals of {payload.target_role}", "Optimize ATS resume metrics with STAR impact bullets"]
            },
            {
                "phase_number": 2,
                "title": "Bridging Key Technical Gaps",
                "duration_weeks": 3,
                "milestones": [f"Deep dive into {skill}" for skill in (missing_skills[:3] or ["System Design", "Distributed Systems"])]
            },
            {
                "phase_number": 3,
                "title": "DSA & Mock Interview Simulation",
                "duration_weeks": 2,
                "milestones": ["Solve 25 LeetCode Medium data structure problems", "Practice 5 mock STAR behavioral rounds"]
            }
        ]
        roadmap = {"phases": phases, "target_role": payload.target_role}

    db_roadmap = models.LearningRoadmap(
        session_id=session_id,
        user_id=user_id,
        target_role=payload.target_role,
        roadmap_data=roadmap,
        completed_tasks=[]
    )
    
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)

    update_session_roadmap(db, session_id, roadmap)
    return db_roadmap

@router.get("", response_model=List[schemas.RoadmapOut])
def list_roadmaps(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    if current_user:
        return db.query(models.LearningRoadmap).filter(models.LearningRoadmap.user_id == current_user.id).all()
    return db.query(models.LearningRoadmap).filter(models.LearningRoadmap.session_id == session_id).all()

@router.patch("/progress", response_model=schemas.RoadmapOut)
def update_roadmap_progress(
    payload: schemas.UpdateRoadmapProgressRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    if current_user:
        roadmap = db.query(models.LearningRoadmap).filter(
            models.LearningRoadmap.user_id == current_user.id
        ).order_by(models.LearningRoadmap.created_at.desc()).first()
    else:
        roadmap = db.query(models.LearningRoadmap).filter(
            models.LearningRoadmap.session_id == session_id
        ).order_by(models.LearningRoadmap.created_at.desc()).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Active learning roadmap not found.")
        
    roadmap.completed_tasks = payload.completed_tasks
    db.commit()
    db.refresh(roadmap)

    session_obj = get_or_create_session(db, session_id)
    session_roadmap_data = dict(roadmap.roadmap_data or {})
    session_roadmap_data["completed_tasks"] = payload.completed_tasks
    update_session_roadmap(db, session_id, session_roadmap_data)

    return roadmap
