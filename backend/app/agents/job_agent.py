import json
import logging
import re
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

JOB_RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "title": {
            "type": "STRING",
            "description": "Job title. If not found, default to 'Software Engineer'."
        },
        "company": {
            "type": "STRING",
            "description": "Company name. If not found, default to 'Confidential'."
        },
        "mandatory_skills": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "List of technical skills explicitly marked as required, mandatory, or must-have."
        },
        "optional_skills": {
            "type": "ARRAY",
            "items": {"type": "STRING"},
            "description": "List of preferred, nice-to-have, or soft skills."
        },
        "requirements": {
            "type": "OBJECT",
            "properties": {
                "min_experience": {
                    "type": "STRING",
                    "description": "Minimum years of experience required (e.g., '3+ years')."
                },
                "tech_stack": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "Primary technologies mentioned in the JD."
                },
                "responsibilities": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "List of key responsibilities and work tasks."
                }
            },
            "required": ["min_experience", "tech_stack", "responsibilities"]
        },
        "thought_process": {
            "type": "STRING",
            "description": "Internal step-by-step reasoning explaining how title, experience, and core stack were identified."
        }
    },
    "required": [
        "title",
        "company",
        "mandatory_skills",
        "optional_skills",
        "requirements",
        "thought_process"
    ]
}

class JobAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            model_name="gemini-1.5-flash",
            temperature=0.1,
            response_schema=JOB_RESPONSE_SCHEMA
        )

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        jd_text = inputs.get("jd_text", "")
        if not jd_text:
            return {"error": "No Job Description text provided."}

        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not self.llm and not api_key:
            return self._mock_parse(jd_text)

        system_instruction = """You are an AI Job Recruiter. Parse the provided Job Description text and extract key structural attributes.

Explain your extraction process in the "thought_process" key first, including:
1. Experience requirements logic.
2. Technical stack categorizations.

Then populate the other keys matching the JSON schema."""

        if self.llm and HAS_LANGCHAIN:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_instruction),
                    ("human", "Job Description Text:\n{jd_text}")
                ])
                chain = prompt | self.llm
                result = chain.invoke({"jd_text": jd_text})
                cleaned = self.clean_json_response(result.content)
                parsed = json.loads(cleaned)
                return parsed
            except Exception as e:
                logger.error(f"Error in JobAgent LLM run: {e}")
                pass

        try:
            res_content = self.call_gemini_http(system_instruction, f"Job Description Text:\n{jd_text}")
            cleaned = self.clean_json_response(res_content)
            parsed = json.loads(cleaned)
            return parsed
        except Exception as e:
            logger.error(f"Error in JobAgent HTTP run: {e}")
            return self._mock_parse(jd_text)

    def _mock_parse(self, text: str) -> Dict[str, Any]:
        """Simple regex-based parsing fallback."""
        title = "Software Engineer"
        company = "Confidential"
        
        title_match = re.search(r'(?:role|title|position):\s*(.*)', text, re.IGNORECASE)
        if title_match:
            title = title_match.group(1).split('\n')[0].strip()
            
        company_match = re.search(r'(?:company|employer):\s*(.*)', text, re.IGNORECASE)
        if company_match:
            company = company_match.group(1).split('\n')[0].strip()

        common_skills = ["Python", "Java", "React", "Node.js", "Docker", "AWS", "SQL", "TypeScript", "FastAPI"]
        found_skills = []
        for skill in common_skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                found_skills.append(skill)
                
        mand = found_skills[:len(found_skills)//2 + 1] if found_skills else ["Python", "SQL"]
        opt = found_skills[len(found_skills)//2 + 1:] if found_skills else ["Docker"]

        return {
            "title": title,
            "company": company,
            "mandatory_skills": mand,
            "optional_skills": opt,
            "requirements": {
                "min_experience": "1-3 years",
                "tech_stack": found_skills if found_skills else ["Python", "SQL"],
                "responsibilities": [
                    "Design and maintain scalable backend microservices.",
                    "Collaborate with frontend teams to define API contracts.",
                    "Optimize applications for maximum speed and scale."
                ]
            }
        }
