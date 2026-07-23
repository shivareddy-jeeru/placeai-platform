from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.interview_agent import InterviewAgent
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_interview

router = APIRouter(prefix="/interview", tags=["interview"])
interview_agent = InterviewAgent()

@router.post("/start", response_model=schemas.InterviewPrepOut, status_code=status.HTTP_201_CREATED)
def start_interview(
    payload: schemas.InterviewGenerateRequest,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    job_text = ""
    if payload.job_id:
        job = db.query(models.JobDescription).filter(
            models.JobDescription.id == payload.job_id,
            models.JobDescription.session_id == session_id
        ).first()
        if job:
            job_text = f"Title: {job.title}\nCompany: {job.company}\nDescription: {job.raw_text}"

    res = interview_agent.run({
        "topic": payload.topic,
        "difficulty": payload.difficulty,
        "job_text": job_text,
        "num_questions": payload.num_questions
    })

    if "error" in res or "questions" not in res:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interview questions generation failed: {res.get('error', 'Unknown error')}"
        )

    db_interview = models.InterviewPrep(
        session_id=session_id,
        user_id=None,
        topic=payload.topic,
        questions=res["questions"]
    )
    
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.post("/evaluate", response_model=schemas.InterviewHistoryOut)
def evaluate_interview(
    payload: schemas.AnswerEvaluationRequest,
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    session_obj = get_or_create_session(db, session_id)
    job_text = ""
    if session_obj.active_job_id:
        job = db.query(models.JobDescription).filter(models.JobDescription.id == session_obj.active_job_id).first()
        if job:
            job_text = f"Title: {job.title}\nCompany: {job.company}\nDescription: {job.raw_text}"

    evaluation_records = []
    total_score = 0.0
    strengths = []
    weaknesses = []
    
    for qna in payload.qna_records:
        question = qna.get("question", "")
        answer = qna.get("answer", "")
        
        eval_res = interview_agent.evaluate_answer(question, answer, job_text)
        
        score = float(eval_res.get("score", 7.0))
        total_score += score
        
        strengths.extend(eval_res.get("strengths", []))
        weaknesses.extend(eval_res.get("weaknesses", []))
        
        evaluation_records.append({
            "question": question,
            "answer": answer,
            "score": score,
            "improved_answer": eval_res.get("improved_answer", ""),
            "feedback": f"Strengths: {', '.join(eval_res.get('strengths', []))}. Weaknesses: {', '.join(eval_res.get('weaknesses', []))}"
        })

    num_q = len(payload.qna_records) or 1
    avg_score = round(total_score / num_q, 1)
    
    grammar_score = round(avg_score * 0.95, 1)
    technical_score = round(avg_score * 0.9, 1)
    confidence_score = round(avg_score * 1.0, 1)

    db_history = models.InterviewHistory(
        session_id=session_id,
        user_id=None,
        topic=payload.topic,
        overall_score=avg_score,
        grammar_score=grammar_score,
        technical_score=technical_score,
        confidence_score=confidence_score,
        detailed_feedback={
            "strengths": list(set(strengths))[:4],
            "weaknesses": list(set(weaknesses))[:4]
        },
        qna_records=evaluation_records
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)

    # Sync to session state cache
    update_session_interview(db, session_id, {
        "overall_score": avg_score,
        "grammar_score": grammar_score,
        "technical_score": technical_score,
        "confidence_score": confidence_score,
        "detailed_feedback": db_history.detailed_feedback,
        "qna_records": evaluation_records
    })

    return db_history

@router.get("/summary", response_model=schemas.InterviewHistoryOut)
def get_interview_summary(
    db: Session = Depends(get_db),
    session_id: str = Depends(get_session_id_from_request)
):
    history = db.query(models.InterviewHistory).filter(
        models.InterviewHistory.session_id == session_id
    ).order_by(models.InterviewHistory.created_at.desc()).first()
    
    if not history:
        raise HTTPException(status_code=404, detail="No interview history found for this session.")
    return history

