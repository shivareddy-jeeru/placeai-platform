import logging
import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Request
from typing import List, Dict, Any

from backend.app import schemas
from backend.app.agents.mentor_agent import MentorAgent
from backend.app.services.evaluator import evaluator_service
from backend.app.rate_limiting import limiter, get_rate_limit

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
):
    """
    Send a message to the AI Mentor. Context is built from the frontend state.
    """
    query = payload.content.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    if len(query) > MAX_QUERY_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"Message is too long. Please keep it under {MAX_QUERY_LENGTH} characters.",
        )

    # Build context from the request payload
    session_context = payload.context or {}
    
    # Send to mentor agent (passing history is optional, depends on agent implementation, but we'll use it)
    mentor_guidance = mentor_agent.guide_student(query, session_context)
    if not isinstance(mentor_guidance, dict):
        bot_content = "I could not generate a response. Please try again."
    else:
        bot_content = mentor_guidance.get("advice", "I could not generate a response. Please try again.")

    # Evaluate the response quality
    eval_results = evaluator_service.evaluate_response(
        query, json.dumps(session_context), bot_content
    )

    # Create dummy response model
    bot_msg = schemas.ChatMessageOut(
        id=str(uuid.uuid4()),
        user_id="stateless",
        session_id=payload.session_id,
        role="assistant",
        content=bot_content,
        agent_used="mentor",
        created_at=datetime.utcnow()
    )

    return ChatResponse(
        message=bot_msg,
        agent_used="mentor",
        relevance_score=eval_results.get("relevance_score", 5.0),
        relevance_reason=eval_results.get("relevance_reason", "Response generated."),
        hallucination_score=eval_results.get("hallucination_score", 0.0),
        hallucination_reason=eval_results.get("hallucination_reason", "Aligned with profile."),
    )
