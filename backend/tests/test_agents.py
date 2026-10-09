"""
Test suite for multi-agent system
"""
import pytest
import json
from backend.app.agents.router import RouterAgent
from backend.app.agents.resume_agent import ResumeAgent
from backend.app.agents.job_agent import JobAgent

class TestRouterAgent:
    """Tests for the Router Agent (intent classification)"""
    
    def test_router_resume_intent(self):
        """Test that router identifies resume-related queries"""
        agent = RouterAgent()
        result = agent.run({
            "query": "Can you analyze my resume and suggest improvements for ATS optimization?"
        })
        
        assert "agent" in result
        assert result["agent"] in ["resume", "general"]
        assert "reason" in result
    
    def test_router_job_intent(self):
        """Test that router identifies job-related queries"""
        agent = RouterAgent()
        result = agent.run({
            "query": "I have a job description, can you analyze if I'm a good fit?"
        })
        
        assert "agent" in result
        assert result["agent"] in ["job", "general"]
        assert "reason" in result
    
    def test_router_interview_intent(self):
        """Test that router identifies interview-related queries"""
        agent = RouterAgent()
        result = agent.run({
            "query": "Can you generate mock interview questions for technical rounds?"
        })
        
        assert "agent" in result
        assert result["agent"] in ["interview", "general"]
        assert "reason" in result
    
    def test_router_learning_intent(self):
        """Test that router identifies learning/roadmap queries"""
        agent = RouterAgent()
        result = agent.run({
            "query": "I want a learning path to become a backend engineer"
        })
        
        assert "agent" in result
        assert result["agent"] in ["learning", "general"]
        assert "reason" in result
    
    def test_router_company_intent(self):
        """Test that router identifies company research queries"""
        agent = RouterAgent()
        result = agent.run({
            "query": "Tell me about Google's corporate overview and recent product developments"
        })
        
        assert "agent" in result
        assert result["agent"] in ["research", "general"]
        assert "reason" in result
    
    def test_router_general_intent(self):
        """Test that router defaults to general for unclear queries"""
        agent = RouterAgent()
        result = agent.run({
            "query": "Hello, how are you?"
        })
        
        assert "agent" in result
        assert "reason" in result
    
    def test_router_empty_query(self):
        """Test router with empty query"""
        agent = RouterAgent()
        result = agent.run({"query": ""})
        
        assert "agent" in result
        assert result["agent"] == "general"
    
    def test_router_returns_valid_json(self):
        """Test that router returns valid JSON"""
        agent = RouterAgent()
        result = agent.run({
            "query": "Sample query"
        })
        
        # Should be able to serialize to JSON
        json_str = json.dumps(result)
        assert json_str is not None

class TestResumeAgent:
    """Tests for the Resume Agent"""
    
    def test_resume_agent_initialization(self):
        """Test that resume agent initializes correctly"""
        agent = ResumeAgent()
        assert agent is not None
        assert agent.model_name == "gemini-1.5-pro"
    
    def test_resume_agent_with_sample_text(self):
        """Test resume agent with sample resume text"""
        agent = ResumeAgent()
        sample_resume = """
        John Doe
        Email: john@example.com
        
        Skills: Python, JavaScript, React, FastAPI, PostgreSQL
        
        Experience:
        Software Engineer at Tech Company (2022-Present)
        - Built REST APIs using FastAPI
        - Worked with PostgreSQL databases
        """
        
        result = agent.run({"resume_text": sample_resume})
        
        # Should have expected keys
        assert "extracted_skills" in result
        assert "experience" in result
        assert "education" in result
        assert "ats_score" in result
    
    def test_resume_agent_empty_input(self):
        """Test resume agent with empty input"""
        agent = ResumeAgent()
        result = agent.run({"resume_text": ""})
        
        assert "error" in result or "extracted_skills" in result
    
    def test_resume_agent_skill_extraction(self):
        """Test that resume agent extracts skills correctly"""
        agent = ResumeAgent()
        sample_text = "Skills: Python, Java, Docker, Kubernetes, AWS"
        
        result = agent.run({"resume_text": sample_text})
        
        # Should extract at least some skills
        if "extracted_skills" in result:
            assert len(result["extracted_skills"]) > 0

class TestJobAgent:
    """Tests for the Job Agent"""
    
    def test_job_agent_initialization(self):
        """Test that job agent initializes correctly"""
        agent = JobAgent()
        assert agent is not None
        assert agent.model_name == "gemini-1.5-flash"
    
    def test_job_agent_with_sample_jd(self):
        """Test job agent with sample job description"""
        agent = JobAgent()
        sample_jd = """
        Senior Python Developer
        
        Requirements:
        - 5+ years Python experience
        - FastAPI/Django knowledge
        - PostgreSQL expertise
        - AWS cloud experience
        - CI/CD pipeline knowledge
        """
        
        result = agent.run({"jd_text": sample_jd})
        
        # Should have expected keys
        assert "extracted_skills" in result or "requirements" in result
    
    def test_job_agent_empty_input(self):
        """Test job agent with empty input"""
        agent = JobAgent()
        result = agent.run({"jd_text": ""})
        
        assert "error" in result or "extracted_skills" in result
