import pytest
from fastapi.testclient import TestClient
from backend.app import models

def test_student_registration_and_jwt(client):
    """Test proper student registration returning JWT and assigning unique user ID."""
    res = client.post("/api/auth/register", json={
        "email": "student_alpha@placeai.co",
        "password": "Password123!",
        "full_name": "Alpha Student",
        "target_role": "Full Stack Engineer"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "student_alpha@placeai.co"
    assert data["user"]["target_role"] == "Full Stack Engineer"
    assert data["user"]["id"] is not None

def test_duplicate_registration_rejected(client):
    """Test duplicate registration is safely rejected."""
    client.post("/api/auth/register", json={
        "email": "duplicate@placeai.co",
        "password": "Password123!",
        "full_name": "First Register"
    })
    res2 = client.post("/api/auth/register", json={
        "email": "duplicate@placeai.co",
        "password": "Password123!",
        "full_name": "Second Register"
    })
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()

def test_login_flow_and_token(client):
    """Test student login and invalid credential rejection."""
    client.post("/api/auth/register", json={
        "email": "login_user@placeai.co",
        "password": "ValidPassword123!",
        "full_name": "Login User"
    })
    
    # Valid login
    res_valid = client.post("/api/auth/login", json={
        "email": "login_user@placeai.co",
        "password": "ValidPassword123!"
    })
    assert res_valid.status_code == 200
    assert "access_token" in res_valid.json()

    # Invalid password
    res_invalid = client.post("/api/auth/login", json={
        "email": "login_user@placeai.co",
        "password": "WrongPassword!"
    })
    assert res_invalid.status_code == 401

def test_protected_me_endpoint_requires_auth(client):
    """Test /api/auth/me returns 401 when token is missing or invalid."""
    # Unauthenticated
    res_unauth = client.get("/api/auth/me")
    assert res_unauth.status_code == 401

    # Register & access with valid bearer token
    reg = client.post("/api/auth/register", json={
        "email": "auth_me@placeai.co",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    
    res_auth = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_auth.status_code == 200
    assert res_auth.json()["email"] == "auth_me@placeai.co"

def test_student_data_isolation_between_accounts(client, db_session):
    """
    Test strict data isolation:
    Student A uploads a resume and creates data.
    Student B cannot see or delete Student A's resume.
    """
    # 1. Register Student A
    reg_a = client.post("/api/auth/register", json={
        "email": "student_a@placeai.co",
        "password": "Password123!"
    })
    token_a = reg_a.json()["access_token"]
    user_a_id = reg_a.json()["user"]["id"]

    # 2. Register Student B
    reg_b = client.post("/api/auth/register", json={
        "email": "student_b@placeai.co",
        "password": "Password123!"
    })
    token_b = reg_b.json()["access_token"]

    # 3. Create resume for Student A
    res_a = models.Resume(
        user_id=user_a_id,
        filename="student_a_resume.pdf",
        ats_score=88.0,
        extracted_skills=["Python", "FastAPI", "React"]
    )
    db_session.add(res_a)
    db_session.commit()
    db_session.refresh(res_a)

    # 4. Student A lists resumes -> sees 1 resume
    res_list_a = client.get("/api/resume", headers={"Authorization": f"Bearer {token_a}"})
    assert res_list_a.status_code == 200
    assert len(res_list_a.json()) == 1

    # 5. Student B lists resumes -> sees 0 resumes (isolated)
    res_list_b = client.get("/api/resume", headers={"Authorization": f"Bearer {token_b}"})
    assert res_list_b.status_code == 200
    assert len(res_list_b.json()) == 0

    # 6. Student B attempts to delete Student A's resume -> blocked with 403
    del_res = client.delete(f"/api/resume/{res_a.id}", headers={"Authorization": f"Bearer {token_b}"})
    assert del_res.status_code == 403

def test_dynamic_readiness_index_calculation(client, db_session):
    """
    Test that readiness index is calculated dynamically from real stored records
    using the documented weights (Resume 20%, Skills 25%, Job Match 20%, Interview 20%, DSA 10%, Progress 5%).
    """
    reg = client.post("/api/auth/register", json={
        "email": "readiness_test@placeai.co",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    user_id = reg.json()["user"]["id"]

    # Before any activity: score is low/zero
    dash_init = client.get("/api/dashboard/summary", headers={"Authorization": f"Bearer {token}"})
    assert dash_init.status_code == 200
    init_score = dash_init.json()["readiness_score"]
    assert init_score < 10.0

    # Add real student resume (90 ATS, 10 skills)
    resume = models.Resume(
        user_id=user_id,
        filename="cv.pdf",
        ats_score=90.0,
        extracted_skills=["Python", "Java", "SQL", "Docker", "FastAPI", "React", "Git", "Redis", "AWS", "Linux"]
    )
    db_session.add(resume)
    db_session.commit()

    # Re-check readiness: Resume 20% * (90/100) = 18.0, Skills 25% * (10/10) = 25.0 -> at least 43.0!
    dash_after = client.get("/api/dashboard/summary", headers={"Authorization": f"Bearer {token}"})
    assert dash_after.status_code == 200
    updated_score = dash_after.json()["readiness_score"]
    assert updated_score >= 43.0
    assert "readiness_breakdown" in dash_after.json()
    assert dash_after.json()["readiness_breakdown"]["resume_quality"]["contribution"] == 18.0
    assert dash_after.json()["readiness_breakdown"]["skills"]["contribution"] == 25.0

def test_interview_rubric_evaluation(client):
    """
    Test deterministic mock interview evaluation with 6-factor documented rubric:
    Technical Accuracy 30%, Problem Solving 25%, STAR Structure 15%,
    Communication 15%, Relevance 10%, Conciseness 5%.
    """
    qna = [{
        "question": "Describe a time when you optimized database query performance.",
        "answer": "In my previous project, we faced a situation where student query response times took 1.5 seconds. My task was to reduce latency under 200ms. I implemented composite PostgreSQL indexes and introduced a Redis caching layer for frequent reads. As a result, query latency was reduced by 75% to 150ms for 10,000 active users."
    }]
    
    res = client.post("/api/interview/evaluate", json={
        "topic": "Backend Performance",
        "qna_records": qna
    })
    assert res.status_code == 200
    data = res.json()
    assert data["overall_score"] > 7.0
    assert "rubric_scores" in data
    assert data["rubric_scores"]["technical_accuracy"] >= 70.0
    assert data["rubric_scores"]["star_structure"] >= 70.0
    assert "strengths" in data["detailed_feedback"]
    assert "improved_answer" in data["detailed_feedback"]
