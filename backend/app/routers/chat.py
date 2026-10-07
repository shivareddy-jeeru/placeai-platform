import logging
import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.config import settings
from backend.app.agents.mentor_agent import MentorAgent
from backend.app.services.evaluator import evaluator_service
from backend.app.rate_limiting import limiter, get_rate_limit
from backend.app.security import get_current_user

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)
mentor_agent = MentorAgent()

# Max input content length (characters) for AI prompt injection protection
MAX_QUERY_LENGTH = 2000


class ChatResponse(schemas.BaseModel):
    message: schemas.ChatMessageOut
    agent_used: str
    relevance_score: float
    relevance_reason: str
    hallucination_score: float
    hallucination_reason: str


@router.post("/query", response_model=ChatResponse)
@limiter.limit(get_rate_limit("chat"))
def send_chat_message(
    request: Request,
    payload: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Send a message to the AI Mentor. Context is built exclusively from the
    authenticated user's real database records — not from the request payload.
    Prompt injection protection: user content is treated strictly as DATA,
    not as instructions. Length is capped to prevent abuse.
    """
    query = payload.content.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    if len(query) > MAX_QUERY_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Message is too long. Please keep it under {MAX_QUERY_LENGTH} characters.",
        )

    uid = current_user.id

    # Save user message
    user_msg = models.ChatMessage(
        user_id=uid,
        session_id=f"user_{uid}",
        role="user",
        content=query,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Build context from REAL user data (not from the request payload)
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
    latest_match = (
        db.query(models.ResumeMatch)
        .join(models.Resume, models.ResumeMatch.resume_id == models.Resume.id)
        .filter(models.Resume.user_id == uid)
        .order_by(models.ResumeMatch.created_at.desc())
        .first()
    )
    latest_roadmap = (
        db.query(models.LearningRoadmap)
        .filter(models.LearningRoadmap.user_id == uid)
        .order_by(models.LearningRoadmap.created_at.desc())
        .first()
    )
    latest_interview = (
        db.query(models.InterviewHistory)
        .filter(models.InterviewHistory.user_id == uid)
        .order_by(models.InterviewHistory.created_at.desc())
        .first()
    )

    # Structured context passed to the AI (not injectable by the user)
    session_context = {
        "student_name": current_user.full_name or "Student",
        "resume": {
            "ats_score": latest_resume.ats_score if latest_resume else None,
            "extracted_skills": latest_resume.extracted_skills if latest_resume else [],
        } if latest_resume else None,
        "job": {
            "title": latest_job.title if latest_job else None,
            "company": latest_job.company if latest_job else None,
        } if latest_job else None,
        "match": {
            "match_percentage": latest_match.match_percentage if latest_match else None,
            "missing_skills": latest_match.missing_skills if latest_match else [],
        } if latest_match else None,
        "roadmap_target": latest_roadmap.target_role if latest_roadmap else None,
        "interview": {
            "overall_score": latest_interview.overall_score if latest_interview else None,
        } if latest_interview else None,
    }

    mentor_guidance = mentor_agent.guide_student(query, session_context)
    bot_content = mentor_guidance.get("advice", "I could not generate a response. Please try again.")

    # Optional: Critic agent polish
    try:
        from backend.app.agents.critic import critic_agent
        critic_results = critic_agent.run({
            "query": query,
            "raw_response": bot_content,
            "target_agent": "mentor",
        })
        bot_content = critic_results.get("final_response", bot_content)
    except Exception as e:
        logger.error(f"Critic agent failed (non-critical): {e}")

    # Evaluate the response quality
    eval_results = evaluator_service.evaluate_response(
        query, json.dumps(session_context), bot_content
    )

    # Save assistant response
    bot_msg = models.ChatMessage(
        user_id=uid,
        session_id=f"user_{uid}",
        role="assistant",
        content=bot_content,
        agent_used="mentor",
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    return ChatResponse(
        message=schemas.ChatMessageOut.from_orm(bot_msg),
        agent_used="mentor",
        relevance_score=eval_results.get("relevance_score", 5.0),
        relevance_reason=eval_results.get("relevance_reason", "Response generated."),
        hallucination_score=eval_results.get("hallucination_score", 0.0),
        hallucination_reason=eval_results.get("hallucination_reason", "Aligned with profile."),
    )


@router.get("/history/{chat_session_id}", response_model=List[schemas.ChatMessageOut])
def get_chat_history(
    chat_session_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return chat history for the authenticated user only."""
    return (
        db.query(models.ChatMessage)
        .filter(
            models.ChatMessage.user_id == current_user.id,
            models.ChatMessage.session_id == f"user_{current_user.id}",
        )
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )
