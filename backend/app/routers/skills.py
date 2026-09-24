from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models
from backend.app.session import get_session_id_from_request, get_or_create_session

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("/gaps")
def get_skill_gaps(
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    """Retrieve list of missing skills for the current session."""
    session_obj = get_or_create_session(db, session_id)
    
    # 1. Try session state cache
    if session_obj.match_data and "missing_skills" in session_obj.match_data:
        return {"missing_skills": session_obj.match_data["missing_skills"]}
        
    # 2. Try querying ResumeMatch database table directly
    latest_match = db.query(models.ResumeMatch).filter(
        models.ResumeMatch.session_id == session_id
    ).order_by(models.ResumeMatch.created_at.desc()).first()
    
    if latest_match:
        return {"missing_skills": latest_match.missing_skills or []}
        
    # 3. Fallback: calculate on-the-fly if active resume & job exist but match wasn't run
    if session_obj.active_resume_id and session_obj.active_job_id:
        resume = db.query(models.Resume).filter(models.Resume.id == session_obj.active_resume_id).first()
        job = db.query(models.JobDescription).filter(models.JobDescription.id == session_obj.active_job_id).first()
        if resume and job:
            resume_skills = set([s.lower() for s in (resume.extracted_skills or [])])
            job_skills = set([s.lower() for s in (job.extracted_skills or [])])
            missing = list(job_skills - resume_skills)
            # Reconstruct casing based on original list
            original_missing = []
            for skill in (job.extracted_skills or []):
                if skill.lower() in missing:
                    original_missing.append(skill)
            return {"missing_skills": original_missing}
            
    # 4. Baseline fallback: if active resume exists, compare against core placement benchmarks
    if session_obj.active_resume_id:
        resume = db.query(models.Resume).filter(models.Resume.id == session_obj.active_resume_id).first()
        if resume:
            extracted = set([s.lower() for s in (resume.extracted_skills or [])])
            benchmarks = ["Docker & Containers", "REST API Architecture", "SQL Performance & Indexes", "System Design", "CI/CD & Deployment"]
            missing = [b for b in benchmarks if not any(b.lower() in s or s in b.lower() for s in extracted)]
            return {"missing_skills": missing if missing else ["System Design", "Docker & Containers"]}

    return {"missing_skills": ["Docker & Containers", "REST API Architecture", "SQL Database Optimization"]}
