"""
Test suite for database models
"""
import pytest
from backend.app import models
from backend.app.security import get_password_hash
from datetime import datetime

class TestUserModel:
    """Tests for User model"""
    
    def test_create_user(self, db_session):
        """Test creating a user"""
        user = models.User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Test User"
        )
        db_session.add(user)
        db_session.commit()
        
        retrieved = db_session.query(models.User).filter_by(email="test@example.com").first()
        assert retrieved is not None
        assert retrieved.email == "test@example.com"
        assert retrieved.full_name == "Test User"
    
    def test_user_unique_email(self, db_session):
        """Test that email is unique"""
        user1 = models.User(
            email="unique@example.com",
            hashed_password=get_password_hash("pass1")
        )
        db_session.add(user1)
        db_session.commit()
        
        user2 = models.User(
            email="unique@example.com",
            hashed_password=get_password_hash("pass2")
        )
        db_session.add(user2)
        
        with pytest.raises(Exception):  # Should raise IntegrityError
            db_session.commit()
    
    def test_user_default_values(self, db_session):
        """Test user default values"""
        user = models.User(
            email="default@example.com",
            hashed_password=get_password_hash("password")
        )
        db_session.add(user)
        db_session.commit()
        
        assert user.is_active == True
        assert user.target_company_tier == "Tier 2"
        assert user.created_at is not None

class TestResumeModel:
    """Tests for Resume model"""
    
    def test_create_resume(self, db_session, test_user):
        """Test creating a resume"""
        resume = models.Resume(
            user_id=test_user.id,
            filename="my_resume.pdf",
            extracted_skills=["Python", "JavaScript"],
            ats_score=85.5
        )
        db_session.add(resume)
        db_session.commit()
        
        retrieved = db_session.query(models.Resume).first()
        assert retrieved is not None
        assert retrieved.user_id == test_user.id
        assert retrieved.filename == "my_resume.pdf"
        assert len(retrieved.extracted_skills) == 2
    
    def test_resume_user_relationship(self, db_session, test_user):
        """Test resume-user relationship"""
        resume = models.Resume(
            user_id=test_user.id,
            filename="resume.pdf",
            extracted_skills=[]
        )
        db_session.add(resume)
        db_session.commit()
        
        # Should be able to access user from resume
        assert resume.user.email == test_user.email

class TestJobDescriptionModel:
    """Tests for JobDescription model"""
    
    def test_create_job_description(self, db_session, test_user):
        """Test creating a job description"""
        job = models.JobDescription(
            user_id=test_user.id,
            title="Senior Python Developer",
            company="Tech Corp",
            raw_text="Job description content...",
            extracted_skills=["Python", "FastAPI", "PostgreSQL"]
        )
        db_session.add(job)
        db_session.commit()
        
        retrieved = db_session.query(models.JobDescription).first()
        assert retrieved is not None
        assert retrieved.title == "Senior Python Developer"
        assert retrieved.company == "Tech Corp"

class TestResumeMatchModel:
    """Tests for ResumeMatch model"""
    
    def test_create_resume_match(self, db_session, test_user):
        """Test creating a resume match"""
        resume = models.Resume(
            user_id=test_user.id,
            filename="resume.pdf",
            extracted_skills=["Python"]
        )
        job = models.JobDescription(
            user_id=test_user.id,
            title="Python Developer",
            raw_text="Job description",
            extracted_skills=["Python", "FastAPI"]
        )
        db_session.add(resume)
        db_session.add(job)
        db_session.commit()
        
        match = models.ResumeMatch(
            resume_id=resume.id,
            job_id=job.id,
            match_percentage=75.5,
            missing_skills=["FastAPI", "Docker"]
        )
        db_session.add(match)
        db_session.commit()
        
        retrieved = db_session.query(models.ResumeMatch).first()
        assert retrieved is not None
        assert retrieved.match_percentage == 75.5
        assert len(retrieved.missing_skills) == 2

class TestCascadeDelete:
    """Tests for cascade delete behavior"""
    
    def test_delete_user_cascades_to_resumes(self, db_session, test_user):
        """Test that deleting user deletes associated resumes"""
        resume = models.Resume(
            user_id=test_user.id,
            filename="resume.pdf",
            extracted_skills=[]
        )
        db_session.add(resume)
        db_session.commit()
        
        # Delete user
        db_session.delete(test_user)
        db_session.commit()
        
        # Resume should be deleted too
        count = db_session.query(models.Resume).count()
        assert count == 0
