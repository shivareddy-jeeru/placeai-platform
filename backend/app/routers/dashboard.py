from fastapi import APIRouter, Depends

from backend.app import schemas

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=schemas.DashboardSummaryOut)
def get_dashboard_summary(
):
    """
    Returns a live dashboard summary calculated from the authenticated user's
    actual stored data. No hard-coded values.

    Readiness Formula (documented):
        Resume Quality   20%  → latest ATS score × 0.20
        Job Match        20%  → latest match % × 0.20
        Interview Score  20%  → (latest interview overall_score / 10) × 100 × 0.20
        Skills           15%  → skill count bonus (capped at 15)
        Learning Roadmap 15%  → completed tasks ratio × 0.15
        Interview Prep   10%  → prep session count bonus (capped at 10)
    Total = min(sum, 100)
    """
    uid = current_user.id

    # ── Total counts ───────────────────────────────────────────────────────────
    total_resumes = db.query(models.Resume).filter(models.Resume.user_id == uid).count()
    total_jobs = db.query(models.JobDescription).filter(models.JobDescription.user_id == uid).count()

    # ── Latest Resume ATS score ────────────────────────────────────────────────
    latest_resume = (
        db.query(models.Resume)
        .filter(models.Resume.user_id == uid)
        .order_by(models.Resume.created_at.desc())
        .first()
    )
    latest_ats_score = latest_resume.ats_score if latest_resume else 0.0
    skills_set: set = set()
    if latest_resume and latest_resume.extracted_skills:
        skills_set.update(latest_resume.extracted_skills)

    # Collect all skills across resumes for accuracy
    all_resumes = db.query(models.Resume).filter(models.Resume.user_id == uid).all()
    for r in all_resumes:
        if r.extracted_skills:
            skills_set.update(r.extracted_skills)

    # ── Latest Job Match ───────────────────────────────────────────────────────
    recent_matches = (
        db.query(models.ResumeMatch)
        .join(models.Resume, models.ResumeMatch.resume_id == models.Resume.id)
        .filter(models.Resume.user_id == uid)
        .order_by(models.ResumeMatch.created_at.desc())
        .limit(5)
        .all()
    )
    latest_match_percentage = recent_matches[0].match_percentage if recent_matches else 0.0

    # ── Latest Interview Score ─────────────────────────────────────────────────
    latest_interview = (
        db.query(models.InterviewHistory)
        .filter(models.InterviewHistory.user_id == uid)
        .order_by(models.InterviewHistory.created_at.desc())
        .first()
    )
    # overall_score stored as 0-10; convert to 0-100
    interview_score_100 = (latest_interview.overall_score * 10.0) if latest_interview else 0.0

    # ── Roadmap progress ───────────────────────────────────────────────────────
    latest_roadmap = (
        db.query(models.LearningRoadmap)
        .filter(models.LearningRoadmap.user_id == uid)
        .order_by(models.LearningRoadmap.created_at.desc())
        .first()
    )
    roadmap_component = 0.0
    if latest_roadmap:
        completed_count = len(latest_roadmap.completed_tasks or [])
        # Assume 10 tasks per roadmap for normalisation
        roadmap_component = min((completed_count / 10.0) * 15.0, 15.0)

    # ── Interview prep sessions ────────────────────────────────────────────────
    prep_count = (
        db.query(models.InterviewPrep)
        .filter(models.InterviewPrep.user_id == uid)
        .count()
    )
    prep_component = min(prep_count * 2.0, 10.0)

    # ── Skills component ───────────────────────────────────────────────────────
    skill_count = len(skills_set)
    # 1 point per unique skill, capped at 15 points (≥15 skills = full marks)
    skills_component = min(skill_count, 15.0)

    # ── Readiness formula ──────────────────────────────────────────────────────
    readiness_score = (
        latest_ats_score * 0.20
        + latest_match_percentage * 0.20
        + interview_score_100 * 0.20
        + skills_component
        + roadmap_component
        + prep_component
    )
    readiness_score = round(min(readiness_score, 100.0), 1)

    # ── Priority action ────────────────────────────────────────────────────────
    if latest_ats_score == 0.0:
        action_title = "Upload Your Resume"
        action_reason = "Start by uploading your resume to get your ATS score, extract your skills, and unlock personalized insights."
        action_module = "Resume Analyzer"
    elif latest_match_percentage == 0.0:
        action_title = "Match Against a Job Description"
        action_reason = "Paste a target job description to discover exactly which skills you are missing and get a ranked skill gap plan."
        action_module = "Job Matcher"
    elif recent_matches and recent_matches[0].missing_skills:
        missing_top = recent_matches[0].missing_skills[:2]
        action_title = f"Bridge Skill Gap: {', '.join(missing_top)}"
        action_reason = f"Your target role requires {', '.join(missing_top)}. Start the learning roadmap to close these gaps."
        action_module = "Learning Roadmap"
    elif interview_score_100 == 0.0:
        action_title = "Practice a Mock Interview"
        action_reason = "Attempt a mock interview to get AI-scored feedback on technical accuracy and communication."
        action_module = "Interview Coach"
    elif interview_score_100 < 60.0:
        action_title = "Improve Interview Score"
        action_reason = "Your last interview scored below 60%. Re-attempt focusing on STAR structure and technical precision."
        action_module = "Interview Coach"
    else:
        action_title = "You're Placement Ready!"
        action_reason = "Strong profile across all metrics. Use Company Research to study hiring processes at target companies."
        action_module = "Company Research"

    # ── Serialize matches ──────────────────────────────────────────────────────
    matches_out = [
        schemas.MatchOut(
            id=m.id,
            resume_id=m.resume_id,
            job_id=m.job_id,
            session_id=None,
            match_percentage=m.match_percentage,
            skill_score=m.skill_score,
            experience_score=m.experience_score,
            keyword_score=m.keyword_score,
            semantic_score=m.semantic_score,
            missing_skills=m.missing_skills or [],
            recommendations=m.recommendations or [],
            created_at=m.created_at,
        )
        for m in recent_matches
    ]

    return schemas.DashboardSummaryOut(
        total_resumes=total_resumes,
        total_jobs=total_jobs,
        latest_ats_score=latest_ats_score,
        latest_match_percentage=latest_match_percentage,
        skills_extracted=sorted(skills_set),
        readiness_score=readiness_score,
        recent_matches=matches_out,
        priority_action_title=action_title,
        priority_action_reason=action_reason,
        priority_action_module=action_module,
    )
