import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON, Boolean, Integer
from sqlalchemy.orm import relationship
from backend.app.database import Base

# Helper to generate UUIDs as string for SQLite compatibility or UUID type for PG
def generate_uuid():
    return str(uuid.uuid4())

class SessionState(Base):
    __tablename__ = "session_states"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    active_resume_id = Column(String(36), nullable=True)
    active_job_id = Column(String(36), nullable=True)
    
    resume_data = Column(JSON, nullable=True)
    job_data = Column(JSON, nullable=True)
    match_data = Column(JSON, nullable=True)
    roadmap_data = Column(JSON, nullable=True)
    interview_data = Column(JSON, nullable=True)
    context_data = Column(JSON, nullable=True)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    target_company_tier = Column(String(50), default="Tier 2") # "Tier 1", "Tier 2", "Tier 3"
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    jobs = relationship("JobDescription", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewPrep", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    interview_histories = relationship("InterviewHistory", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String(36), index=True, nullable=True)
    filename = Column(String(255), nullable=False)
    extracted_skills = Column(JSON, nullable=True) # List of skills
    education = Column(JSON, nullable=True) # List of dicts
    experience = Column(JSON, nullable=True) # List of dicts
    projects = Column(JSON, nullable=True) # List of dicts
    ats_score = Column(Float, default=0.0)
    improvements = Column(JSON, nullable=True) # List of strings/suggestions
    strengths = Column(JSON, nullable=True) # List of strengths (strings)
    faults = Column(JSON, nullable=True) # List of formatting faults/gaps (strings)
    suitable_roles = Column(JSON, nullable=True) # List of suitable job roles (strings)
    roadmap = Column(JSON, nullable=True) # Structured custom study roadmap
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="resumes")
    matches = relationship("ResumeMatch", back_populates="resume", cascade="all, delete-orphan")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String(36), index=True, nullable=True)
    title = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=False)
    extracted_skills = Column(JSON, nullable=True) # List of skills
    requirements = Column(JSON, nullable=True) # Categorized requirements
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="jobs")
    matches = relationship("ResumeMatch", back_populates="job", cascade="all, delete-orphan")

class ResumeMatch(Base):
    __tablename__ = "resume_matches"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(String(36), ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String(36), index=True, nullable=True)
    match_percentage = Column(Float, default=0.0)
    skill_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    keyword_score = Column(Float, default=0.0)
    semantic_score = Column(Float, default=0.0)
    missing_skills = Column(JSON, nullable=True) # List of missing skills
    recommendations = Column(JSON, nullable=True) # Actionable recommendations
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resume = relationship("Resume", back_populates="matches")
    job = relationship("JobDescription", back_populates="matches")

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String(36), index=True, nullable=True)
    target_role = Column(String(255), nullable=False)
    roadmap_data = Column(JSON, nullable=False)
    completed_tasks = Column(JSON, default=list) # List of completed course/project titles
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="roadmaps")

class InterviewPrep(Base):
    __tablename__ = "interview_preps"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String(36), index=True, nullable=True)
    topic = Column(String(255), nullable=False)
    questions = Column(JSON, nullable=False) # List of Q&As with answers, difficulty levels, and types
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="interviews")

class CompanyResearch(Base):
    __tablename__ = "company_research"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_name = Column(String(255), unique=True, index=True, nullable=False)
    summary = Column(JSON, nullable=False) # Structured research overview
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String(255), index=True, nullable=False)
    role = Column(String(50), nullable=False) # "user" or "assistant"
    content = Column(Text, nullable=False)
    agent_used = Column(String(100), nullable=True) # Resume, Job, Interview, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="chats")

class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    filename = Column(String(255), nullable=False)
    extracted_skills = Column(JSON, nullable=True)
    ats_score = Column(Float, default=0.0)
    improvements = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resume = relationship("Resume", back_populates="versions")

class InterviewHistory(Base):
    __tablename__ = "interview_histories"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    session_id = Column(String(36), index=True, nullable=True)
    topic = Column(String(255), nullable=False)
    overall_score = Column(Float, default=0.0)
    grammar_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    detailed_feedback = Column(JSON, nullable=True) # Dict of strengths, weaknesses, tips
    qna_records = Column(JSON, nullable=True) # List of QA dicts
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="interview_histories")

