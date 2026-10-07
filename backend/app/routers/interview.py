import re
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.app.database import get_db
from backend.app import models, schemas
from backend.app.agents.interview_agent import InterviewAgent
from backend.app.security import get_current_user_optional
from backend.app.session import get_session_id_from_request, get_or_create_session, update_session_interview

router = APIRouter(prefix="/interview", tags=["interview"])
interview_agent = InterviewAgent()
logger = logging.getLogger(__name__)

# Documented STAR rubric evaluation engine
def evaluate_rubric_deterministic(question: str, answer: str, topic: str = "") -> Dict[str, Any]:
    """
    Evaluates candidate response across 6 documented categories:
      1. Technical Accuracy (30%)
      2. Problem Solving (25%)
      3. STAR Structure (15%)
      4. Communication (15%)
      5. Relevance (10%)
      6. Conciseness (5%)
    Total: 100%
    """
    clean_ans = answer.strip()
    words = clean_ans.split()
    word_cnt = len(words)
    norm = clean_ans.lower()

    # 1. Technical Accuracy (30% weight, max 10.0)
    tech_keywords = [
        'api', 'database', 'sql', 'python', 'react', 'fastapi', 'cache', 'redis', 'index',
        'async', 'docker', 'algorithm', 'complexity', 'o(n)', 'latency', 'query', 'scale',
        'pipeline', 'microservice', 'distributed', 'thread', 'memory', 'cpu', 'aws'
    ]
    tech_matches = sum(1 for kw in tech_keywords if kw in norm)
    tech_score = min(10.0, max(4.0, (tech_matches / 4.0) * 10.0))

    # 2. Problem Solving (25% weight, max 10.0)
    ps_keywords = ['issue', 'problem', 'bottleneck', 'investigated', 'identified', 'solved', 'fixed', 'optimized', 'debugged', 'solution', 'analyzed']
    ps_matches = sum(1 for kw in ps_keywords if kw in norm)
    ps_score = min(10.0, max(5.0, (ps_matches / 3.0) * 10.0))

    # 3. STAR Structure (15% weight, max 10.0)
    star_indicators = {
        'situation': ['situation', 'when i was', 'in my previous', 'at company', 'during project', 'we faced'],
        'task': ['task', 'my role', 'responsible for', 'goal was', 'objective', 'assigned'],
        'action': ['action', 'i implemented', 'i designed', 'i decided', 'i created', 'i used', 'i refactored'],
        'result': ['result', 'outcome', 'reduced', 'improved', 'decreased', 'increased', '%', 'latency', 'faster', 'delivered']
    }
    star_present = sum(1 for part, kws in star_indicators.items() if any(k in norm for k in kws))
    star_score = min(10.0, max(4.0, (star_present / 4.0) * 10.0))

    # 4. Communication & Grammar (15% weight, max 10.0)
    sentences = [s for s in re.split(r'[.!?]+', clean_ans) if s.strip()]
    if len(sentences) >= 3 and word_cnt >= 40:
        comm_score = 8.5
    elif len(sentences) >= 2:
        comm_score = 7.0
    else:
        comm_score = 5.0

    # 5. Relevance (10% weight, max 10.0)
    q_words = set(re.findall(r'\b\w{4,}\b', question.lower()))
    a_words = set(re.findall(r'\b\w{4,}\b', norm))
    overlap = len(q_words.intersection(a_words))
    rel_score = min(10.0, max(5.0, (overlap / max(1, len(q_words) * 0.3)) * 10.0))

    # 6. Conciseness (5% weight, max 10.0)
    if 60 <= word_cnt <= 350:
        conc_score = 9.5
    elif 30 <= word_cnt < 60:
        conc_score = 7.0
    elif word_cnt > 350:
        conc_score = 6.5
    else:
        conc_score = 4.0

    # Weighted Overall Score (out of 10.0)
    overall_10 = (
        (tech_score * 0.30) +
        (ps_score * 0.25) +
        (star_score * 0.15) +
        (comm_score * 0.15) +
        (rel_score * 0.10) +
        (conc_score * 0.05)
    )
    overall_score = round(overall_10, 1)

    strengths = []
    weaknesses = []
    if tech_score >= 8.0:
        strengths.append("Strong technical terminology and domain reasoning.")
    else:
        weaknesses.append("Elaborate on specific architectural components, tools, or data structures.")

    if star_score >= 8.0:
        strengths.append("Clear STAR progression from problem to measurable impact.")
    else:
        weaknesses.append("Structure your response clearly with Situation, Task, Action, and quantifiable Result.")

    if ps_score >= 8.0:
        strengths.append("Systematic troubleshooting and root cause explanation.")

    if conc_score < 7.0:
        weaknesses.append("Aim for 100-250 concise words focusing on your specific contribution.")

    improved_answer = (
        f"Situation: While working on a {topic or 'web service'}, our team encountered a critical latency spike during peak traffic.\n"
        f"Task: My goal was to identify the query bottleneck and optimize response times below 200ms.\n"
        f"Action: I analyzed the SQL execution plan, added composite database indexes, and implemented a Redis caching layer for frequent read requests.\n"
        f"Result: API response latency dropped by 65% (from 1.1s to 180ms), with zero downtime and improved throughput for 10,000+ users."
    )

    return {
        "overall_score": overall_score,
        "rubric_scores": {
            "technical_accuracy": round(tech_score * 10.0, 1),
            "problem_solving": round(ps_score * 10.0, 1),
            "star_structure": round(star_score * 10.0, 1),
            "communication": round(comm_score * 10.0, 1),
            "relevance": round(rel_score * 10.0, 1),
            "conciseness": round(conc_score * 10.0, 1)
        },
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improved_answer": improved_answer
    }

@router.post("/start", response_model=schemas.InterviewPrepOut, status_code=status.HTTP_201_CREATED)
def start_interview(
    payload: schemas.InterviewGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Generates interview scenario questions tailored to role and student level.
    """
    job_text = ""
    user_id = current_user.id if current_user else None

    if payload.job_id:
        job = db.query(models.JobDescription).filter(models.JobDescription.id == payload.job_id).first()
        if job:
            job_text = f"Title: {job.title}\nCompany: {job.company}\nDescription: {job.raw_text}"

    # Adaptive difficulty check
    difficulty = payload.difficulty or "Intermediate"
    query_filter = models.InterviewHistory.user_id == user_id if user_id else models.InterviewHistory.session_id == session_id
    past_history = db.query(models.InterviewHistory).filter(query_filter).order_by(models.InterviewHistory.created_at.desc()).first()
    
    if past_history:
        if past_history.overall_score >= 8.5:
            difficulty = "Advanced"
        elif past_history.overall_score <= 5.5:
            difficulty = "Beginner"

    res = interview_agent.run({
        "topic": payload.topic,
        "difficulty": difficulty,
        "job_text": job_text,
        "num_questions": payload.num_questions
    })

    questions = res.get("questions") or [
        {
            "question": f"Describe a complex problem you solved in {payload.topic}. What was your approach and measurable result?",
            "expected_skills": ["Problem Solving", "System Architecture"],
            "difficulty": difficulty,
            "type": "Technical Scenario"
        },
        {
            "question": "Tell me about a time when you had to optimize a slow application or database query. What steps did you take?",
            "expected_skills": ["Database Indexing", "Caching", "Performance"],
            "difficulty": difficulty,
            "type": "STAR Behavioral"
        }
    ]

    db_interview = models.InterviewPrep(
        session_id=session_id,
        user_id=user_id,
        topic=payload.topic,
        questions=questions
    )
    
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@router.post("/evaluate", response_model=schemas.InterviewHistoryOut)
def evaluate_interview(
    payload: schemas.AnswerEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Evaluates interview responses deterministically using documented STAR rubric.
    Never allows the client to supply or override scores.
    """
    user_id = current_user.id if current_user else None
    evaluation_records = []
    total_score = 0.0
    all_strengths = []
    all_weaknesses = []
    latest_improved = ""

    avg_rubrics = {
        "technical_accuracy": 0.0,
        "problem_solving": 0.0,
        "star_structure": 0.0,
        "communication": 0.0,
        "relevance": 0.0,
        "conciseness": 0.0
    }

    qna_list = payload.qna_records if payload.qna_records else [{"question": "Technical Scenario", "answer": ""}]

    for qna in qna_list:
        q_text = qna.get("question", "")
        a_text = qna.get("answer", "")

        rubric_res = evaluate_rubric_deterministic(q_text, a_text, payload.topic)
        score = rubric_res["overall_score"]
        total_score += score
        all_strengths.extend(rubric_res["strengths"])
        all_weaknesses.extend(rubric_res["weaknesses"])
        latest_improved = rubric_res["improved_answer"]

        for k, v in rubric_res["rubric_scores"].items():
            avg_rubrics[k] += v

        evaluation_records.append({
            "question": q_text,
            "answer": a_text,
            "score": score,
            "improved_answer": rubric_res["improved_answer"],
            "feedback": f"Strengths: {', '.join(rubric_res['strengths'])}. Focus: {', '.join(rubric_res['weaknesses'])}"
        })

    num_q = len(qna_list)
    avg_score = round(total_score / num_q, 1)

    for k in avg_rubrics:
        avg_rubrics[k] = round(avg_rubrics[k] / num_q, 1)

    grammar_score = avg_rubrics["communication"]
    technical_score = avg_rubrics["technical_accuracy"]
    confidence_score = avg_rubrics["problem_solving"]

    db_history = models.InterviewHistory(
        session_id=session_id,
        user_id=user_id,
        topic=payload.topic,
        overall_score=avg_score,
        grammar_score=grammar_score,
        technical_score=technical_score,
        confidence_score=confidence_score,
        rubric_scores=avg_rubrics,
        detailed_feedback={
            "strengths": list(dict.fromkeys(all_strengths))[:4],
            "weaknesses": list(dict.fromkeys(all_weaknesses))[:4],
            "improved_answer": latest_improved
        },
        qna_records=evaluation_records
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)

    # Sync to session state cache
    update_session_interview(db, session_id, {
        "overall_score": avg_score,
        "rubric_scores": avg_rubrics,
        "detailed_feedback": db_history.detailed_feedback,
        "qna_records": evaluation_records
    })

    return db_history

@router.get("/summary", response_model=schemas.InterviewHistoryOut)
def get_interview_summary(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
    session_id: str = Depends(get_session_id_from_request)
):
    """
    Returns latest mock interview history with rubric breakdown.
    """
    if current_user:
        history = db.query(models.InterviewHistory).filter(
            models.InterviewHistory.user_id == current_user.id
        ).order_by(models.InterviewHistory.created_at.desc()).first()
    else:
        history = db.query(models.InterviewHistory).filter(
            models.InterviewHistory.session_id == session_id
        ).order_by(models.InterviewHistory.created_at.desc()).first()
    
    if not history:
        raise HTTPException(status_code=404, detail="No interview history found.")
    return history
