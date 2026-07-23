from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.session import get_session_id_from_request

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummaryOut)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    # Total Resumes in session
    total_resumes = db.query(models.Resume).filter(models.Resume.session_id == session_id).count()
    
    # Total Job Descriptions in session
    total_jobs = db.query(models.JobDescription).filter(models.JobDescription.session_id == session_id).count()
    
    # Latest ATS Score
    latest_resume = db.query(models.Resume).filter(
        models.Resume.session_id == session_id
    ).order_by(models.Resume.created_at.desc()).first()
    latest_ats_score = latest_resume.ats_score if latest_resume else 0.0

    # Recent matches & Latest Match percentage
    recent_matches = db.query(models.ResumeMatch).filter(
        models.ResumeMatch.session_id == session_id
    ).order_by(models.ResumeMatch.created_at.desc()).limit(5).all()
    
    latest_match_percentage = recent_matches[0].match_percentage if recent_matches else 0.0

    # Skills Extracted
    skills_set = set()
    resumes = db.query(models.Resume).filter(models.Resume.session_id == session_id).all()
    for resume in resumes:
        if resume.extracted_skills:
            for skill in resume.extracted_skills:
                skills_set.add(skill)
                
    # Readiness Score calculation:
    prep_count = db.query(models.InterviewPrep).filter(models.InterviewPrep.session_id == session_id).count()
    prep_bonus = min(prep_count * 5.0, 20.0)
    
    latest_roadmap = db.query(models.LearningRoadmap).filter(
        models.LearningRoadmap.session_id == session_id
    ).order_by(models.LearningRoadmap.created_at.desc()).first()
    
    roadmap_bonus = 0.0
    if latest_roadmap:
        completed_count = len(latest_roadmap.completed_tasks or [])
        roadmap_bonus = min((completed_count / 6.0) * 20.0, 20.0)
    
    base_readiness = (latest_ats_score * 0.30) + (latest_match_percentage * 0.30)
    if latest_ats_score == 0.0 and latest_match_percentage == 0.0:
        base_readiness = 20.0 # baseline
        
    readiness_score = min(base_readiness + prep_bonus + roadmap_bonus, 100.0)

    # Map database objects to MatchOut schema
    matches_out = []
    for match in recent_matches:
        matches_out.append(
            schemas.MatchOut(
                id=match.id,
                resume_id=match.resume_id,
                job_id=match.job_id,
                session_id=match.session_id,
                match_percentage=match.match_percentage,
                skill_score=match.skill_score,
                experience_score=match.experience_score,
                keyword_score=match.keyword_score,
                semantic_score=match.semantic_score,
                missing_skills=match.missing_skills or [],
                recommendations=match.recommendations or [],
                created_at=match.created_at
            )
        )

    return schemas.DashboardSummaryOut(
        total_resumes=total_resumes,
        total_jobs=total_jobs,
        latest_ats_score=latest_ats_score,
        latest_match_percentage=latest_match_percentage,
        skills_extracted=list(skills_set),
        readiness_score=round(readiness_score, 1),
        recent_matches=matches_out
    )

