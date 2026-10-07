from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.security import get_current_user_optional
from backend.app.session import get_session_id_from_request

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=schemas.DashboardSummaryOut)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Returns authentic, real-time student placement readiness and dashboard analytics.
    Calculates deterministic Readiness Index from actual database records:
      - Resume Quality: 20%
      - Skills: 25%
      - Job Match: 20%
      - Interview Performance: 20%
      - DSA / Assessment: 10%
      - Learning Progress: 5%
    """
    user_id = current_user.id if current_user else None

    # 1. Total Resumes & Latest ATS Score
    if user_id:
        total_resumes = db.query(models.Resume).filter(models.Resume.user_id == user_id).count()
        latest_resume = db.query(models.Resume).filter(
            models.Resume.user_id == user_id
        ).order_by(models.Resume.created_at.desc()).first()
        resumes_list = db.query(models.Resume).filter(models.Resume.user_id == user_id).all()
    else:
        total_resumes = db.query(models.Resume).filter(models.Resume.session_id == session_id).count()
        latest_resume = db.query(models.Resume).filter(
            models.Resume.session_id == session_id
        ).order_by(models.Resume.created_at.desc()).first()
        resumes_list = db.query(models.Resume).filter(models.Resume.session_id == session_id).all()

    latest_ats_score = latest_resume.ats_score if latest_resume else 0.0

    # 2. Total Job Descriptions & Recent Matches
    if user_id:
        total_jobs = db.query(models.JobDescription).filter(models.JobDescription.user_id == user_id).count()
        recent_matches = db.query(models.ResumeMatch).filter(
            (models.ResumeMatch.user_id == user_id) |
            (models.ResumeMatch.resume_id.in_([r.id for r in resumes_list]))
        ).order_by(models.ResumeMatch.created_at.desc()).limit(5).all()
    else:
        total_jobs = db.query(models.JobDescription).filter(models.JobDescription.session_id == session_id).count()
        recent_matches = db.query(models.ResumeMatch).filter(
            models.ResumeMatch.session_id == session_id
        ).order_by(models.ResumeMatch.created_at.desc()).limit(5).all()

    latest_match_percentage = recent_matches[0].match_percentage if recent_matches else 0.0

    # 3. Verified Skills Extracted
    skills_set = set()
    for res in resumes_list:
        if res.extracted_skills:
            for skill in res.extracted_skills:
                skills_set.add(skill)

    # 4. Interview History Score
    if user_id:
        latest_interview = db.query(models.InterviewHistory).filter(
            models.InterviewHistory.user_id == user_id
        ).order_by(models.InterviewHistory.created_at.desc()).first()
    else:
        latest_interview = db.query(models.InterviewHistory).filter(
            models.InterviewHistory.session_id == session_id
        ).order_by(models.InterviewHistory.created_at.desc()).first()

    if latest_interview:
        # Scale to 0-100: if scored 1-10, scale by 10
        raw_score = latest_interview.overall_score
        interview_score_100 = raw_score * 10.0 if raw_score <= 10.0 else raw_score
    else:
        interview_score_100 = 0.0

    # 5. DSA Problems Solved & Streak
    dsa_problems_solved = current_user.dsa_problems_solved if current_user else 0
    current_streak = current_user.current_streak if current_user else 1

    # 6. Learning Roadmap Progress
    if user_id:
        latest_roadmap = db.query(models.LearningRoadmap).filter(
            models.LearningRoadmap.user_id == user_id
        ).order_by(models.LearningRoadmap.created_at.desc()).first()
    else:
        latest_roadmap = db.query(models.LearningRoadmap).filter(
            models.LearningRoadmap.session_id == session_id
        ).order_by(models.LearningRoadmap.created_at.desc()).first()

    roadmap_completed_count = 0
    roadmap_total_count = 5
    if latest_roadmap and latest_roadmap.roadmap_data:
        roadmap_completed_count = len(latest_roadmap.completed_tasks or [])
        raw_phases = latest_roadmap.roadmap_data.get("phases", []) if isinstance(latest_roadmap.roadmap_data, dict) else []
        roadmap_total_count = max(len(raw_phases), 4)

    # ─── CALCULATE DETERMINISTIC READINESS FORMULA ─────────────────────
    # Component 1: Resume Quality (20%)
    resume_comp_score = min(100.0, latest_ats_score)
    resume_contribution = (resume_comp_score / 100.0) * 20.0

    # Component 2: Skills Coverage (25%) - target 10 verified core skills
    skills_comp_score = min(100.0, (len(skills_set) / 10.0) * 100.0)
    skills_contribution = (skills_comp_score / 100.0) * 25.0

    # Component 3: Job Match Alignment (20%)
    job_comp_score = min(100.0, latest_match_percentage)
    job_contribution = (job_comp_score / 100.0) * 20.0

    # Component 4: Interview Performance (20%)
    interview_comp_score = min(100.0, interview_score_100)
    interview_contribution = (interview_comp_score / 100.0) * 20.0

    # Component 5: DSA / Assessment (10%) - target 50 problems
    dsa_comp_score = min(100.0, (dsa_problems_solved / 50.0) * 100.0)
    dsa_contribution = (dsa_comp_score / 100.0) * 10.0

    # Component 6: Learning Roadmap Progress (5%)
    learning_comp_score = min(100.0, (roadmap_completed_count / max(1, roadmap_total_count)) * 100.0)
    learning_contribution = (learning_comp_score / 100.0) * 5.0

    readiness_score = round(
        resume_contribution +
        skills_contribution +
        job_contribution +
        interview_contribution +
        dsa_contribution +
        learning_contribution,
        1
    )

    readiness_breakdown = {
        "resume_quality": {
            "score": round(resume_comp_score, 1),
            "weight": 20.0,
            "contribution": round(resume_contribution, 1),
            "status": f"{latest_ats_score:.0f}/100 ATS Score" if latest_resume else "Resume not yet uploaded"
        },
        "skills": {
            "score": round(skills_comp_score, 1),
            "weight": 25.0,
            "contribution": round(skills_contribution, 1),
            "status": f"{len(skills_set)} verified skills detected"
        },
        "job_match": {
            "score": round(job_comp_score, 1),
            "weight": 20.0,
            "contribution": round(job_contribution, 1),
            "status": f"{latest_match_percentage:.0f}% target match" if recent_matches else "No target role matched yet"
        },
        "interview_performance": {
            "score": round(interview_comp_score, 1),
            "weight": 20.0,
            "contribution": round(interview_contribution, 1),
            "status": f"{interview_score_100:.0f}% mock interview score" if latest_interview else "No mock interview attempted"
        },
        "dsa_assessment": {
            "score": round(dsa_comp_score, 1),
            "weight": 10.0,
            "contribution": round(dsa_contribution, 1),
            "status": f"{dsa_problems_solved} / 50 problems solved"
        },
        "learning_progress": {
            "score": round(learning_comp_score, 1),
            "weight": 5.0,
            "contribution": round(learning_contribution, 1),
            "status": f"{roadmap_completed_count} milestones completed"
        }
    }

    # ─── ACTION RECOMMENDATION FROM REAL GAPS ──────────────────────────
    if total_resumes == 0:
        action_title = "Upload Your Technical Resume"
        action_reason = "Run your resume through the deterministic 9-factor ATS scorer to extract verified skills and unlock personalized job matches."
        action_module = "Resume Analyzer"
    elif total_jobs == 0:
        action_title = "Target a Job Description"
        action_reason = "Match your resume against a target SDE/Engineering posting to identify exact skill gaps and missing keywords."
        action_module = "Job Matcher"
    elif recent_matches and recent_matches[0].missing_skills:
        missing_top = recent_matches[0].missing_skills[:2]
        action_title = f"Bridge Critical Skill Gap: {', '.join(missing_top)}"
        action_reason = f"Your target role requires {', '.join(missing_top)}. Review your generated roadmap to master these competencies."
        action_module = "Learning Roadmap"
    elif latest_interview is None:
        action_title = "Practice Mock Technical Interview"
        action_reason = "Complete your first STAR behavioral and coding mock round to assess communication and technical depth."
        action_module = "Interview Coach"
    elif interview_score_100 < 75.0:
        action_title = "Improve Interview Technical Score"
        action_reason = "Your recent interview score is below 75%. Practice STAR structure and complexity explanations."
        action_module = "Interview Coach"
    else:
        action_title = "Prepare Target Company Revision"
        action_reason = "Your placement metrics indicate high readiness. Research hiring rounds, compensation trends, and technical questions."
        action_module = "Company Research"

    matches_out = [
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
        for match in recent_matches
    ]

    return schemas.DashboardSummaryOut(
        total_resumes=total_resumes,
        total_jobs=total_jobs,
        latest_ats_score=latest_ats_score,
        latest_match_percentage=latest_match_percentage,
        skills_extracted=sorted(list(skills_set)),
        readiness_score=readiness_score,
        readiness_breakdown=readiness_breakdown,
        readiness_formula="Readiness = 20% Resume + 25% Skills + 20% Job Match + 20% Interview + 10% DSA + 5% Progress",
        why_changed="Recalculated dynamically from student's active database submissions and completed milestones.",
        streak_count=current_streak,
        dsa_problems_solved=dsa_problems_solved,
        recent_matches=matches_out,
        priority_action_title=action_title,
        priority_action_reason=action_reason,
        priority_action_module=action_module,
        student_profile=current_user
    )
