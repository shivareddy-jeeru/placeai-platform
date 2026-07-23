import logging
import requests
import json
import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.config import settings
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_match

# Optional LangChain imports
try:
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_google_genai import ChatGoogleGenerativeAI
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

router = APIRouter(prefix="/matching", tags=["matching"])
logger = logging.getLogger(__name__)

def run_matching_engine(resume: models.Resume, job: models.JobDescription) -> dict:
    """Invokes LLM matching or falls back to skill set intersection."""
    resume_skills = set([s.lower() for s in (resume.extracted_skills or [])])
    job_skills_raw = job.extracted_skills or []
    job_skills = set([s.lower() for s in job_skills_raw])
    
    missing_skills = list(job_skills - resume_skills)
    
    if job_skills:
        overlap = len(job_skills & resume_skills)
        base_match = (overlap / len(job_skills)) * 100
    else:
        base_match = 50.0

    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        recs = [
            f"Add missing skills to your resume: {', '.join(missing_skills[:3])}." if missing_skills else "Align projects with role.",
            "Tailor project descriptions to highlight engineering complexity.",
            "Quantify your bullet points with metrics (e.g. 'improved performance by 15%')."
        ]
        skill_s = round(min(max(base_match, 10.0), 95.0), 1)
        key_s = round(min(max(base_match * 0.9, 10.0), 95.0), 1)
        exp_s = 70.0
        sem_s = 65.0
        overall = round((skill_s * 0.4) + (exp_s * 0.2) + (key_s * 0.2) + (sem_s * 0.2), 1)
        return {
            "match_percentage": overall,
            "skill_score": skill_s,
            "experience_score": exp_s,
            "keyword_score": key_s,
            "semantic_score": sem_s,
            "missing_skills": missing_skills,
            "recommendations": recs
        }

    system_instruction = """You are an ATS Match Engine. Evaluate the compatibility between a candidate's resume and a job description.
Return a valid JSON object containing exactly these keys:
- "match_percentage": overall score (float between 0.0 and 100.0) based on weighted average of criteria.
- "skill_score": score (float between 0.0 and 100.0) based on technical/soft skill overlap.
- "experience_score": score (float between 0.0 and 100.0) based on years of experience, seniority, and responsibilities.
- "keyword_score": score (float between 0.0 and 100.0) based on specific tools, frameworks, and buzzwords mentioned.
- "semantic_score": score (float between 0.0 and 100.0) based on the overall role domain match (e.g. Frontend to Frontend).
- "missing_skills": list of skills needed for the job that are not found in the resume.
- "recommendations": list of actionable bullet points to improve the match.

Ensure all outputs are formatted as valid JSON. Do not return markdown blocks like ```json. Return raw JSON text only."""

    human_msg = f"""Candidate Resume Skills: {list(resume_skills)}
Candidate Projects/Experience: Experience: {resume.experience or []}. Projects: {resume.projects or []}

Job Description Technical Requirements: {job.raw_text[:2000]}
Job Description Required Skills: {list(job_skills)}"""

    bot_content = None

    if HAS_LANGCHAIN:
        try:
            llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=api_key, temperature=0.1)
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_instruction),
                ("human", human_msg)
            ])
            chain = prompt | llm
            result = chain.invoke({
                "resume_skills": list(resume_skills),
                "resume_details": f"Experience: {resume.experience or []}. Projects: {resume.projects or []}",
                "job_details": job.raw_text[:2000],
                "job_skills": list(job_skills)
            })
            bot_content = result.content.strip()
        except Exception as e:
            logger.error(f"Error in standard LLM match: {e}")
            bot_content = None

    if bot_content is None:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": human_msg}]}],
                "systemInstruction": {"parts": [{"text": system_instruction}]},
                "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
            }
            res = requests.post(url, json=payload)
            if res.status_code == 200:
                bot_content = res.json()["candidates"][0]["content"]["parts"][0]["text"]
            else:
                raise Exception(f"Gemini API returned status code {res.status_code}")
        except Exception as e:
            logger.error(f"HTTP match execution failed: {e}")
            skill_s = round(base_match, 1)
            key_s = round(base_match * 0.9, 1)
            exp_s = 70.0
            sem_s = 65.0
            overall = round((skill_s * 0.4) + (exp_s * 0.2) + (key_s * 0.2) + (sem_s * 0.2), 1)
            return {
                "match_percentage": overall,
                "skill_score": skill_s,
                "experience_score": exp_s,
                "keyword_score": key_s,
                "semantic_score": sem_s,
                "missing_skills": missing_skills,
                "recommendations": ["Align experience bullet points with keywords.", "Highlight projects using the target stack."]
            }

    try:
        cleaned = bot_content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned)
        return {
            "match_percentage": float(data.get("match_percentage", base_match)),
            "skill_score": float(data.get("skill_score", base_match)),
            "experience_score": float(data.get("experience_score", 70.0)),
            "keyword_score": float(data.get("keyword_score", base_match)),
            "semantic_score": float(data.get("semantic_score", 65.0)),
            "missing_skills": data.get("missing_skills", missing_skills),
            "recommendations": data.get("recommendations", [])
        }
    except Exception as e:
        logger.error(f"Failed parsing match response: {e}")
        skill_s = round(base_match, 1)
        key_s = round(base_match * 0.9, 1)
        exp_s = 70.0
        sem_s = 65.0
        overall = round((skill_s * 0.4) + (exp_s * 0.2) + (key_s * 0.2) + (sem_s * 0.2), 1)
        return {
            "match_percentage": overall,
            "skill_score": skill_s,
            "experience_score": exp_s,
            "keyword_score": key_s,
            "semantic_score": sem_s,
            "missing_skills": missing_skills,
            "recommendations": ["Align experience bullet points with keywords.", "Highlight projects using the target stack."]
        }

@router.post("/match", response_model=schemas.MatchOut, status_code=status.HTTP_201_CREATED)
def match_resume_to_job(
    payload: schemas.MatchRequest,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    # Verify resume belongs to session
    resume = db.query(models.Resume).filter(
        models.Resume.id == payload.resume_id,
        models.Resume.session_id == session_id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found in this session")

    # Verify job description belongs to session
    job = db.query(models.JobDescription).filter(
        models.JobDescription.id == payload.job_id,
        models.JobDescription.session_id == session_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job Description not found in this session")

    # Check if match already exists
    existing = db.query(models.ResumeMatch).filter(
        models.ResumeMatch.resume_id == payload.resume_id,
        models.ResumeMatch.job_id == payload.job_id,
        models.ResumeMatch.session_id == session_id
    ).first()
    
    if existing:
        return existing

    result = run_matching_engine(resume, job)

    db_match = models.ResumeMatch(
        session_id=session_id,
        resume_id=payload.resume_id,
        job_id=payload.job_id,
        match_percentage=result["match_percentage"],
        skill_score=result["skill_score"],
        experience_score=result["experience_score"],
        keyword_score=result["keyword_score"],
        semantic_score=result["semantic_score"],
        missing_skills=result["missing_skills"],
        recommendations=result["recommendations"]
    )
    
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    # Update active SessionState cache
    update_session_match(db, session_id, result)

    return db_match

@router.get("/{match_id}", response_model=schemas.MatchOut)
def get_match(
    match_id: str,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    match = db.query(models.ResumeMatch).filter(
        models.ResumeMatch.id == match_id,
        models.ResumeMatch.session_id == session_id
    ).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match metrics not found")
    return match

@router.get("", response_model=List[schemas.MatchOut])
def list_matches(
    job_id: str = None,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    query = db.query(models.ResumeMatch).filter(
        models.ResumeMatch.session_id == session_id
    )
    if job_id:
        query = query.filter(models.ResumeMatch.job_id == job_id)
    return query.all()


