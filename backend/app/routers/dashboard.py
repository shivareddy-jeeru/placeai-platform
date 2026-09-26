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
                
    # Interview History Score
    latest_interview = db.query(models.InterviewHistory).filter(
        models.InterviewHistory.session_id == session_id
    ).order_by(models.InterviewHistory.created_at.desc()).first()
    interview_score = (latest_interview.overall_score * 10.0) if latest_interview else 0.0

    # Readiness Score calculation:
    prep_count = db.query(models.InterviewPrep).filter(models.InterviewPrep.session_id == session_id).count()
    prep_bonus = min(prep_count * 5.0, 15.0)
    
    latest_roadmap = db.query(models.LearningRoadmap).filter(
        models.LearningRoadmap.session_id == session_id
    ).order_by(models.LearningRoadmap.created_at.desc()).first()
    
    roadmap_bonus = 0.0
    if latest_roadmap:
        completed_count = len(latest_roadmap.completed_tasks or [])
        roadmap_bonus = min((completed_count / 5.0) * 15.0, 15.0)
    
    base_readiness = (latest_ats_score * 0.35) + (latest_match_percentage * 0.35) + (interview_score * 0.30)
    if latest_ats_score == 0.0 and latest_match_percentage == 0.0 and interview_score == 0.0:
        base_readiness = 20.0 # baseline
        
    readiness_score = min(base_readiness + prep_bonus + roadmap_bonus, 100.0)

    # Dynamic Personalized Recommendation Logic ("Today's Highest Priority Action")
    if latest_ats_score == 0.0:
        action_title = "Upload Your Technical Resume"
        action_reason = "Analyze your ATS formatting and extract your technical skill stack to unlock personalized matches."
        action_module = "Resume Analyzer"
    elif latest_match_percentage == 0.0:
        action_title = "Target a Job Description"
        action_reason = "Match your resume against a target role to discover technical skill gaps and generate a custom study plan."
        action_module = "Job Matcher"
    elif recent_matches and recent_matches[0].missing_skills:
        missing_top = recent_matches[0].missing_skills[:2]
        action_title = f"Bridge Skill Gap: {', '.join(missing_top)}"
        action_reason = f"Your target job requires {', '.join(missing_top)}. Complete your generated learning roadmap to boost compatibility."
        action_module = "Learning Roadmap"
    elif interview_score == 0.0:
        action_title = "Practice Mock Technical Interview"
        action_reason = "Test your technical communication and receive STAR-structured feedback."
        action_module = "Interview Coach"
    elif interview_score < 70.0:
        action_title = "Improve Interview Technical Score"
        action_reason = "Your recent interview score was under 7/10. Re-attempt mock interview questions focusing on code complexity and STAR format."
        action_module = "Interview Coach"
    else:
        action_title = "Ready for Placement Applications"
        action_reason = "Your profile shows strong alignment with target roles. Use Company Research to study hiring trends and interview patterns."
        action_module = "Company Research"

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
        recent_matches=matches_out,
        priority_action_title=action_title,
        priority_action_reason=action_reason,
        priority_action_module=action_module
    )

