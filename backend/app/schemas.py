from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    is_admin: Optional[bool] = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    target_company_tier: str = "Tier 2"
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UpdateUserTierRequest(BaseModel):
    target_company_tier: str


# Resume Schemas
class ResumeCreate(BaseModel):
    filename: str
    extracted_skills: List[str]
    education: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    ats_score: float
    improvements: List[str]
    strengths: List[str]
    faults: List[str]
    suitable_roles: List[str]
    roadmap: Dict[str, Any]

class ResumeOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    filename: str
    extracted_skills: Optional[List[str]] = []
    education: Optional[List[Dict[str, Any]]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    ats_score: float
    improvements: Optional[List[str]] = []
    strengths: Optional[List[str]] = []
    faults: Optional[List[str]] = []
    suitable_roles: Optional[List[str]] = []
    roadmap: Optional[Dict[str, Any]] = {}
    created_at: datetime

    class Config:
        from_attributes = True

# Job Description Schemas
class JobDescriptionCreate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    raw_text: str

class JobDescriptionOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    raw_text: str
    extracted_skills: Optional[List[str]] = []
    requirements: Optional[Dict[str, Any]] = {}
    created_at: datetime

    class Config:
        from_attributes = True

# Resume Match Schemas
class MatchRequest(BaseModel):
    resume_id: str
    job_id: str

class MatchOut(BaseModel):
    id: str
    resume_id: str
    job_id: str
    session_id: Optional[str] = None
    match_percentage: float
    skill_score: float = 0.0
    experience_score: float = 0.0
    keyword_score: float = 0.0
    semantic_score: float = 0.0
    missing_skills: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Learning Roadmap Schemas
class RoadmapCreateRequest(BaseModel):
    target_role: str
    skill_gap_source: Optional[str] = None # can be a job ID, or custom skill gaps
    current_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []

class RoadmapOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    target_role: str
    roadmap_data: Dict[str, Any]
    completed_tasks: List[str] = []
    created_at: datetime

    class Config:
        from_attributes = True

class UpdateRoadmapProgressRequest(BaseModel):
    completed_tasks: List[str]


# Interview Prep Schemas
class InterviewGenerateRequest(BaseModel):
    topic: str # e.g., "Python Developer", "React Frontend", or "Product Manager"
    difficulty: Optional[str] = "Intermediate" # Beginner, Intermediate, Advanced
    job_id: Optional[str] = None # Optional job description to target
    num_questions: Optional[int] = 5

class InterviewPrepOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    topic: str
    questions: List[Dict[str, Any]] # question, answer, type, difficulty
    created_at: datetime

    class Config:
        from_attributes = True

# Company Research Schemas
class CompanyResearchRequest(BaseModel):
    company_name: str

class CompanyResearchOut(BaseModel):
    id: str
    company_name: str
    summary: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

# Chat Message Schemas
class ChatMessageCreate(BaseModel):
    session_id: str
    content: str

class ChatMessageOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: str
    role: str
    content: str
    agent_used: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Summary
class DashboardSummaryOut(BaseModel):
    total_resumes: int
    total_jobs: int
    latest_ats_score: float
    latest_match_percentage: float
    skills_extracted: List[str]
    readiness_score: float # calculated metric
    recent_matches: List[MatchOut]

# Resume Version Schemas
class ResumeVersionOut(BaseModel):
    id: str
    resume_id: str
    version_number: int
    filename: str
    extracted_skills: Optional[List[str]] = []
    ats_score: float
    improvements: Optional[List[str]] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Interview History Schemas
class InterviewHistoryCreate(BaseModel):
    topic: str
    overall_score: float
    grammar_score: float
    technical_score: float
    confidence_score: float
    detailed_feedback: Dict[str, Any]
    qna_records: List[Dict[str, Any]]

class InterviewHistoryOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    topic: str
    overall_score: float
    grammar_score: float
    technical_score: float
    confidence_score: float
    detailed_feedback: Optional[Dict[str, Any]] = {}
    qna_records: Optional[List[Dict[str, Any]]] = []
    created_at: datetime

    class Config:
        from_attributes = True

class AnswerEvaluationRequest(BaseModel):
    topic: str
    qna_records: List[Dict[str, Any]] # List of dicts with {"question": str, "answer": str}


