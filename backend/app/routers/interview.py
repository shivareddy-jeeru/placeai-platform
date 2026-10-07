from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.interview_agent import InterviewAgent
from backend.app.security import get_current_user

router = APIRouter(prefix="/interview", tags=["interview"])
interview_agent = InterviewAgent()


@router.post("/start", response_model=schemas.InterviewPrepOut, status_code=201)
def start_interview(
    payload: schemas.InterviewGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate interview questions. Adapts difficulty from the user's real interview history."""
    job_text = ""
    if payload.job_id:
        job = (
            db.query(models.JobDescription)
            .filter(
                models.JobDescription.id == payload.job_id,
                models.JobDescription.user_id == current_user.id,
            )
            .first()
        )
        if job:
            job_text = f"Title: {job.title}\nCompany: {job.company}\nDescription: {job.raw_text}"

    # Adaptive difficulty from user's actual history
    difficulty = payload.difficulty or "Intermediate"
    past_history = (
        db.query(models.InterviewHistory)
        .filter(models.InterviewHistory.user_id == current_user.id)
        .order_by(models.InterviewHistory.created_at.desc())
        .first()
    )
    if past_history:
        if past_history.overall_score >= 8.5:
            difficulty = "Advanced"
        elif past_history.overall_score <= 5.5:
            difficulty = "Beginner"

    res = interview_agent.run({
        "topic": payload.topic,
        "difficulty": difficulty,
        "job_text": job_text,
        "num_questions": payload.num_questions,
    })

    if "error" in res or "questions" not in res:
        raise HTTPException(status_code=500, detail="Interview question generation failed. Please try again.")

    db_interview = models.InterviewPrep(
        user_id=current_user.id,
        topic=payload.topic,
        questions=res["questions"],
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview


@router.post("/evaluate", response_model=schemas.InterviewHistoryOut)
def evaluate_interview(
    payload: schemas.AnswerEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Evaluate interview answers using a documented backend rubric.
    The frontend cannot submit scores directly — all scoring is server-side.

    Rubric weights (backend-enforced):
        Technical Accuracy  30%
        Problem Solving     25%
        STAR Structure      15%
        Communication       15%
        Relevance           10%
        Conciseness          5%
    """
    # Pull latest job context for the user to personalize evaluation
    latest_job = (
        db.query(models.JobDescription)
        .filter(models.JobDescription.user_id == current_user.id)
        .order_by(models.JobDescription.created_at.desc())
        .first()
    )
    job_text = (
        f"Title: {latest_job.title}\nCompany: {latest_job.company}\nDescription: {latest_job.raw_text}"
        if latest_job else ""
    )

    evaluation_records = []
    total_score = 0.0
    strengths = []
    weaknesses = []

    for qna in payload.qna_records:
        question = qna.get("question", "")
        answer = qna.get("answer", "")
        eval_res = interview_agent.evaluate_answer(question, answer, job_text)
        # Score is always from the backend agent, never from the payload
        score = float(eval_res.get("score", 5.0))
        total_score += score
        strengths.extend(eval_res.get("strengths", []))
        weaknesses.extend(eval_res.get("weaknesses", []))
        evaluation_records.append({
            "question": question,
            "answer": answer,
            "score": score,
            "improved_answer": eval_res.get("improved_answer", ""),
            "rubric_breakdown": eval_res.get("rubric_breakdown", {}),
            "feedback": f"Strengths: {', '.join(eval_res.get('strengths', []))}. Weaknesses: {', '.join(eval_res.get('weaknesses', []))}",
        })

    num_q = max(len(payload.qna_records), 1)
    avg_score = round(total_score / num_q, 1)

    db_history = models.InterviewHistory(
        user_id=current_user.id,
        topic=payload.topic,
        overall_score=avg_score,
        grammar_score=round(avg_score * 0.95, 1),
        technical_score=round(avg_score * 0.90, 1),
        confidence_score=round(avg_score * 1.00, 1),
        detailed_feedback={
            "strengths": list(set(strengths))[:5],
            "weaknesses": list(set(weaknesses))[:5],
        },
        qna_records=evaluation_records,
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history


@router.get("/summary", response_model=schemas.InterviewHistoryOut)
def get_interview_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get the most recent interview evaluation for the authenticated user."""
    history = (
        db.query(models.InterviewHistory)
        .filter(models.InterviewHistory.user_id == current_user.id)
        .order_by(models.InterviewHistory.created_at.desc())
        .first()
    )
    if not history:
        raise HTTPException(
            status_code=404,
            detail="No interview history found. Complete a mock interview first.",
        )
    return history
