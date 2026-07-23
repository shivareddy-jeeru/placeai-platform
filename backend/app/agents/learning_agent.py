import json
import logging
import os
from typing import Dict, Any
from backend.app.agents.base import BaseAgent
from backend.app.config import settings

try:
    from langchain_core.prompts import ChatPromptTemplate
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

logger = logging.getLogger(__name__)

class LearningAgent(BaseAgent):
    def __init__(self):
        super().__init__(model_name="gemini-1.5-pro", temperature=0.3)

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        target_role = inputs.get("target_role", "Software Engineer")
        current_skills = inputs.get("current_skills", [])
        missing_skills = inputs.get("missing_skills", [])

        if not missing_skills:
            missing_skills = ["System Design", "Cloud Deployments", "Advanced DS & Algo"]

        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not self.llm and not api_key:
            return self._mock_roadmap(target_role, missing_skills)

        system_instruction = """You are an AI Career Coach and Learning Path Designer.
Given the target role, current skills, and missing skills, design a personalized, multi-stage learning roadmap.

Your output MUST be a valid JSON object containing exactly these keys:
- "target_role": The role targeted
- "summary": A brief encouraging overview of the roadmap
- "phases": A list of phase objects (3 phases representing Beginner, Intermediate, and Advanced skill levels), each phase having:
  - "phase_name": (string, e.g. "Phase 1: Foundations")
  - "difficulty": (string: "Beginner" or "Intermediate" or "Advanced")
  - "skills_addressed": (list of missing skills addressed)
  - "courses": A list of course suggestions. Each course has "title", "platform".
  - "certifications": Suggested certificates (list of strings).
  - "projects": A list of project ideas. Each project has "title", "description", "tech_stack".
  - "practice_platforms": List of interactive sites to practice.
  - "duration_weeks": Estimated duration in weeks (number).

Ensure all outputs are formatted as valid JSON. Do not return markdown blocks like ```json. Return raw JSON text only."""

        human_msg = f"Target Role: {target_role}\nCurrent Skills: {current_skills}\nMissing Skills: {missing_skills}"

        if self.llm and HAS_LANGCHAIN:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_instruction),
                    ("human", human_msg)
                ])
                chain = prompt | self.llm
                result = chain.invoke({
                    "target_role": target_role,
                    "current_skills": current_skills,
                    "missing_skills": missing_skills
                })
                cleaned = self.clean_json_response(result.content)
                parsed = json.loads(cleaned)
                return parsed
            except Exception as e:
                logger.error(f"Error in LearningAgent LLM run: {e}")
                pass

        try:
            res_content = self.call_gemini_http(system_instruction, human_msg)
            cleaned = self.clean_json_response(res_content)
            parsed = json.loads(cleaned)
            return parsed
        except Exception as e:
            logger.error(f"Error in LearningAgent HTTP run: {e}")
            return self._mock_roadmap(target_role, missing_skills)

    def _mock_roadmap(self, role: str, missing_skills: list) -> Dict[str, Any]:
        """Offline roadmap generator fallback."""
        return {
            "target_role": role,
            "summary": f"Your roadmap to transition successfully into a {role} role by covering key technical gaps.",
            "phases": [
                {
                    "phase_name": "Phase 1: Foundation & API Basics",
                    "difficulty": "Beginner",
                    "skills_addressed": [s for s in missing_skills[:2]] if missing_skills else ["Python REST APIs"],
                    "courses": [
                        {"title": "FastAPI Complete Guide", "platform": "Udemy"},
                        {"title": "PostgreSQL Fundamentals", "platform": "Coursera"}
                    ],
                    "certifications": ["AWS Certified Cloud Practitioner"],
                    "projects": [
                        {
                            "title": "Inventory Management API",
                            "description": "Create a fully functional REST API with CRUD capabilities, user validation, and local DB migrations.",
                            "tech_stack": ["Python", "FastAPI", "SQLite"]
                        }
                    ],
                    "practice_platforms": ["LeetCode (Easy)", "HackerRank SQL Challenges"],
                    "duration_weeks": 4
                },
                {
                    "phase_name": "Phase 2: Deployment & Containers",
                    "difficulty": "Intermediate",
                    "skills_addressed": [s for s in missing_skills[2:4]] if len(missing_skills) > 2 else ["Docker & Deployments"],
                    "courses": [
                        {"title": "Docker and Kubernetes: The Complete Guide", "platform": "Udemy"}
                    ],
                    "certifications": ["HashiCorp Certified: Terraform Associate"],
                    "projects": [
                        {
                            "title": "Dockerized Portfolio App",
                            "description": "Containerize a backend and frontend dashboard and set up local networking using docker-compose.",
                            "tech_stack": ["Docker", "docker-compose", "FastAPI", "React"]
                        }
                    ],
                    "practice_platforms": ["Play with Docker", "Katacoda Exercises"],
                    "duration_weeks": 5
                },
                {
                    "phase_name": "Phase 3: Scale & System Design",
                    "difficulty": "Advanced",
                    "skills_addressed": [s for s in missing_skills[4:]] if len(missing_skills) > 4 else ["System Design", "Caching"],
                    "courses": [
                        {"title": "Grokking the System Design Interview", "platform": "DesignGurus"}
                    ],
                    "certifications": ["AWS Certified Solutions Architect - Associate"],
                    "projects": [
                        {
                            "title": "Distributed Task Scheduler",
                            "description": "Construct a background tasks scheduler utilizing redis queues and worker processes, featuring load balancing.",
                            "tech_stack": ["Celery", "Redis", "FastAPI", "Docker"]
                        }
                    ],
                    "practice_platforms": ["LeetCode (Medium/Hard)", "System Design Primer"],
                    "duration_weeks": 6
                }
            ]
        }
