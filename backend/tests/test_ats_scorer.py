import pytest
from backend.app.services.ats_scorer import ats_scorer

SAMPLE_RESUME_TEXT = """
Shiva Kumar
Email: shiva@example.com | Phone: +1-555-0199 | LinkedIn: linkedin.com/in/shiva | GitHub: github.com/shiva

PROFESSIONAL SUMMARY
Passionate Software Engineer with experience in building scalable web microservices and REST APIs using Python, FastAPI, PostgreSQL, and Docker.

TECHNICAL SKILLS
Languages & Frameworks: Python, Java, JavaScript, TypeScript, FastAPI, React, Node.js, SQL
Databases & Cloud: PostgreSQL, Redis, Docker, Git, REST API, AWS

WORK EXPERIENCE
Software Engineering Intern | Tech Solutions Inc. | June 2024 - August 2024
- Engineered backend REST APIs using FastAPI and Python, improving query response time by 30%.
- Processed 10,000 records daily and optimized SQL query execution latency by 40ms.
- Built Docker containerized services deployed to AWS.

PROJECTS
E-Commerce Recommendation Engine | Python, React, PostgreSQL
- Implemented collaborative filtering recommendation system for 500 users.

EDUCATION
Bachelor of Technology in Computer Science & Engineering | State Technical University | 2021 - 2025
"""

SAMPLE_JD_TEXT = """
We are looking for a Senior Software Engineer (Python / FastAPI).
Required Skills: Python, FastAPI, PostgreSQL, Docker, REST API, Git
Preferred Skills: AWS, Redis, Kubernetes
"""

def test_resume_ats_score_calculation():
    result = ats_scorer.calculate_resume_ats_score(SAMPLE_RESUME_TEXT)
    assert "resumeAtsScore" in result
    assert result["resumeAtsScore"] > 70.0
    assert result["is_scanned_pdf"] is False
    assert result["breakdown"]["contact"] == 5.0  # Email, Phone, Social (5% documented weight)
    assert result["breakdown"]["sections"] >= 4.0  # Standard sections found (5% documented weight)
    assert result["metric_count"] >= 3           # 30%, 10,000, 40ms, 500
    assert "Python" in result["detected_skills"]
    assert "FastAPI" in result["detected_skills"]

def test_scanned_pdf_detection():
    scanned_text = "Image-only page PDF sample with no selectable text."
    result = ats_scorer.calculate_resume_ats_score(scanned_text)
    assert result["is_scanned_pdf"] is True
    assert result["breakdown"]["readability"] == 0
    assert any("scanned" in w.lower() for w in result["warnings"])

def test_job_match_score_calculation():
    result = ats_scorer.calculate_job_match_score(SAMPLE_RESUME_TEXT, SAMPLE_JD_TEXT)
    assert "jobMatchScore" in result
    assert result["jobMatchScore"] > 70.0
    assert "FastAPI" in result["matchedSkills"]
    assert "Python" in result["matchedSkills"]
    assert "Kubernetes" in result["missingSkills"]
