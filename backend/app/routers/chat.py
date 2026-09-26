import os
import logging
import requests
import json
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.config import settings
from backend.app.session import get_session_id_from_request, get_or_create_session
from backend.app.agents.mentor_agent import MentorAgent
from backend.app.services.evaluator import evaluator_service
from backend.app.rate_limiting import limiter, get_rate_limit

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)
mentor_agent = MentorAgent()

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
    request: Request, payload: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    # Use session_id from payload if present, otherwise fallback to header
    active_session_id = payload.session_id or session_id
    query = payload.content.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")

    # 1. Save user message to database
    user_msg = models.ChatMessage(
        session_id=active_session_id,
        user_id=None,
        role="user",
        content=query
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 2. Load profile/session context
    latest_resume = db.query(models.Resume).filter(
        models.Resume.session_id == active_session_id
    ).order_by(models.Resume.created_at.desc()).first()

    latest_job = db.query(models.JobDescription).filter(
        models.JobDescription.session_id == active_session_id
    ).order_by(models.JobDescription.created_at.desc()).first()

    latest_match = db.query(models.ResumeMatch).filter(
        models.ResumeMatch.session_id == active_session_id
    ).order_by(models.ResumeMatch.created_at.desc()).first()

    latest_roadmap = db.query(models.LearningRoadmap).filter(
        models.LearningRoadmap.session_id == active_session_id
    ).order_by(models.LearningRoadmap.created_at.desc()).first()

    latest_interview = db.query(models.InterviewHistory).filter(
        models.InterviewHistory.session_id == active_session_id
    ).order_by(models.InterviewHistory.created_at.desc()).first()

    # Construct context dict for mentor agent
    session_context = {
        "resume": {
            "ats_score": latest_resume.ats_score if latest_resume else 0.0,
            "extracted_skills": latest_resume.extracted_skills if latest_resume else []
        } if latest_resume else {},
        "job": {
            "title": latest_job.title if latest_job else "Software Engineer",
            "raw_text": latest_job.raw_text if latest_job else ""
        } if latest_job else {},
        "match": {
            "match_percentage": latest_match.match_percentage if latest_match else 0.0,
            "missing_skills": latest_match.missing_skills if latest_match else []
        } if latest_match else {},
        "roadmap": {
            "roadmap": latest_roadmap.roadmap_data if latest_roadmap else []
        } if latest_roadmap else {},
        "interview": {
            "overall_score": latest_interview.overall_score if latest_interview else "Not Started"
        } if latest_interview else {}
    }

    # 3. Call MentorAgent to get advice
    mentor_guidance = mentor_agent.guide_student(query, session_context)
    bot_content = mentor_guidance.get("advice", "")

    # 4. Polish response using Critic Agent if available
    from backend.app.agents.critic import critic_agent
    try:
        critic_results = critic_agent.run({
            "query": query,
            "raw_response": bot_content,
            "target_agent": "mentor"
        })
        bot_content = critic_results.get("final_response", bot_content)
    except Exception as e:
        logger.error(f"Critic Agent execution failed: {e}")

    # 5. Evaluate response using EvaluatorService
    eval_context = f"Session Context: {json.dumps(session_context)}"
    eval_results = evaluator_service.evaluate_response(query, eval_context, bot_content)

    # 6. Save bot response to database
    bot_msg = models.ChatMessage(
        session_id=active_session_id,
        user_id=None,
        role="assistant",
        content=bot_content,
        agent_used="mentor"
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)

    schema_bot_msg = schemas.ChatMessageOut.from_orm(bot_msg)

    return ChatResponse(
        message=schema_bot_msg,
        agent_used="mentor",
        relevance_score=eval_results.get("relevance_score", 5.0),
        relevance_reason=eval_results.get("relevance_reason", "Polished guidance."),
        hallucination_score=eval_results.get("hallucination_score", 0.0),
        hallucination_reason=eval_results.get("hallucination_reason", "Aligned with profile.")
    )

@router.get("/history/{session_id}", response_model=List[schemas.ChatMessageOut])
def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db)
):
    history = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.created_at.asc()).all()
    return history

