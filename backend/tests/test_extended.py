import pytest
from sqlalchemy.orm import Session
from backend.app import models, schemas
from backend.app.agents.critic import CriticAgent
from backend.app.routers.matching import run_matching_engine

def test_resume_match_granular_scores_save(db_session: Session, test_user: models.User):
    """Verify that multi-dimensional matching scores save properly to the database."""
    # Create test resume
    resume = models.Resume(
        user_id=test_user.id,
        filename="test_resume.pdf",
        extracted_skills=["Python", "FastAPI"]
    )
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)
    
    # Create test job
    job = models.JobDescription(
        user_id=test_user.id,
        title="Python Engineer",
        raw_text="We need Python, FastAPI, and SQL experience.",
        extracted_skills=["Python", "FastAPI", "SQL"]
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    
    # Save a match record
    match = models.ResumeMatch(
        resume_id=resume.id,
        job_id=job.id,
        match_percentage=75.0,
        skill_score=80.0,
        experience_score=70.0,
        keyword_score=75.0,
        semantic_score=72.5,
        missing_skills=["SQL"]
    )
    db_session.add(match)
    db_session.commit()
    db_session.refresh(match)
    
    # Retrieve and assert
    db_match = db_session.query(models.ResumeMatch).filter_by(id=match.id).first()
    assert db_match is not None
    assert db_match.skill_score == 80.0
    assert db_match.experience_score == 70.0
    assert db_match.keyword_score == 75.0
    assert db_match.semantic_score == 72.5
    assert "SQL" in db_match.missing_skills

def test_resume_version_cascade_delete(db_session: Session, test_user: models.User):
    """Verify that deleting a Resume cascades to delete ResumeVersion entries."""
    resume = models.Resume(user_id=test_user.id, filename="test_res.pdf")
    db_session.add(resume)
    db_session.commit()
    
    version = models.ResumeVersion(
        resume_id=resume.id,
        version_number=1,
        filename="test_res.pdf",
        extracted_skills=["Python"],
        ats_score=82.0
    )
    db_session.add(version)
    db_session.commit()
    
    # Delete the resume
    db_session.delete(resume)
    db_session.commit()
    
    # Verify version is gone
    db_version = db_session.query(models.ResumeVersion).filter_by(resume_id=resume.id).first()
    assert db_version is None

def test_interview_history_creation(db_session: Session, test_user: models.User):
    """Verify that InterviewHistory records can be stored and retrieved successfully."""
    history = models.InterviewHistory(
        user_id=test_user.id,
        topic="FastAPI Backend Developer",
        overall_score=85.0,
        grammar_score=90.0,
        technical_score=80.0,
        confidence_score=85.0,
        detailed_feedback={"strengths": "Great technical depth.", "weaknesses": "Speaks a bit too fast."},
        qna_records=[{"question": "What is dependency injection?", "answer": "A design pattern where objects are passed dependencies.", "score": 8.5}]
    )
    db_session.add(history)
    db_session.commit()
    db_session.refresh(history)
    
    db_history = db_session.query(models.InterviewHistory).filter_by(id=history.id).first()
    assert db_history is not None
    assert db_history.topic == "FastAPI Backend Developer"
    assert db_history.overall_score == 85.0
    assert db_history.detailed_feedback["strengths"] == "Great technical depth."
    assert len(db_history.qna_records) == 1

def test_critic_agent_fallback_parsing():
    """Verify that CriticAgent falls back cleanly to raw text if model/key is not set."""
    agent = CriticAgent()
    inputs = {
        "query": "Improve my introduction.",
        "raw_response": "Hello, I am a junior engineer looking for work.",
        "target_agent": "resume"
    }
    # Run the critic agent (should return raw response fallback in mock environment)
    results = agent.run(inputs)
    assert "final_response" in results
    assert len(results["final_response"]) > 0

def test_resume_v2_1_fields(db_session: Session, test_user: models.User):
    """Verify that strengths, faults, suitable_roles, and roadmap fields save and retrieve on the Resume model."""
    resume = models.Resume(
        user_id=test_user.id,
        filename="custom_resume.pdf",
        ats_score=85.0,
        strengths=["Core FastAPI", "PostgreSQL experience"],
        faults=["No LinkedIn link"],
        suitable_roles=["Backend Developer"],
        roadmap={"milestones": [{"week": "Week 1", "topic": "Testing", "tasks": ["Run pytest"]}]}
    )
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)
    
    db_res = db_session.query(models.Resume).filter_by(id=resume.id).first()
    assert db_res is not None
    assert "Core FastAPI" in db_res.strengths
    assert "No LinkedIn link" in db_res.faults
    assert "Backend Developer" in db_res.suitable_roles
    assert db_res.roadmap["milestones"][0]["week"] == "Week 1"

