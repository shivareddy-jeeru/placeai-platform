from fastapi import APIRouter, Depends
from backend.app import models

router = APIRouter(prefix="/skills", tags=["skills"])


@router.get("/gaps")
def get_skill_gaps(
):
    """
    Retrieve missing skills for the authenticated user based on their real data.
    Priority: Latest job match → On-the-fly comparison → No data state.
    """
    uid = current_user.id

    # 1. Best source: latest job match record
    latest_match = (
        db.query(models.ResumeMatch)
        .join(models.Resume, models.ResumeMatch.resume_id == models.Resume.id)
        .filter(models.Resume.user_id == uid)
        .order_by(models.ResumeMatch.created_at.desc())
        .first()
    )
    if latest_match and latest_match.missing_skills:
        return {"missing_skills": latest_match.missing_skills, "source": "job_match"}

    # 2. Fallback: compare latest resume skills vs latest job skills on the fly
    latest_resume = (
        db.query(models.Resume)
        .filter(models.Resume.user_id == uid)
        .order_by(models.Resume.created_at.desc())
        .first()
    )
    latest_job = (
        db.query(models.JobDescription)
        .filter(models.JobDescription.user_id == uid)
        .order_by(models.JobDescription.created_at.desc())
        .first()
    )
    if latest_resume and latest_job:
        resume_skills = {s.lower() for s in (latest_resume.extracted_skills or [])}
        job_skills = {s.lower() for s in (latest_job.extracted_skills or [])}
        missing_lower = job_skills - resume_skills
        # Restore original casing from the job's skill list
        original_missing = [
            s for s in (latest_job.extracted_skills or []) if s.lower() in missing_lower
        ]
        return {"missing_skills": original_missing, "source": "computed"}

    # 3. No data — return empty so frontend can show an empty state
    return {"missing_skills": [], "source": "no_data"}
