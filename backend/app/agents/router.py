import json
import logging
import os
from typing import Dict, Any, List
from backend.app.agents.base import BaseAgent
from backend.app.config import settings

try:
    from langchain_core.prompts import ChatPromptTemplate
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

logger = logging.getLogger(__name__)

class RouterAgent(BaseAgent):
    def __init__(self):
        super().__init__(model_name="gemini-1.5-flash", temperature=0.0)

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        query = inputs.get("query", "")
        if not query:
            return {"agent": "general", "tasks": [{"agent": "general", "description": "Default helper"}], "reason": "No query provided."}

        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not self.llm and not api_key:
            return self._mock_route(query)

        system_instruction = """You are a Career Assistant Routing and Planning System. Your job is to analyze a user's prompt, plan the necessary sub-tasks, and route it to the correct specialized agents.
If the prompt requires multiple stages (e.g. evaluating skills then generating a roadmap), plan them sequentially in the "tasks" list.

Choose from the following specialized agents:
1. "resume" - User wants to analyze a resume, calculate ATS scores, extract skills, or improve their resume structure.
2. "job" - User wants to analyze a Job Description, extract requirements, or understand a specific job post.
3. "learning" - User wants a customized learning path, roadmaps, courses to take, certifications, or project ideas.
4. "interview" - User wants to practice interview questions, prepare for technical/behavioral/HR/project rounds, or get model answers.
5. "research" - User wants details, products, hiring trends, recent news, or interview experiences for a specific company.
6. "mentor" - User wants overall status guidance, advice on what to do next, readiness checks, or holistic mentor feedback based on their active profile.
7. "general" - General career advice, casual conversation, questions not fitting any specific agent.

Your output MUST be a valid JSON object containing exactly these keys:
- "agent": the primary agent (one of ["resume", "job", "learning", "interview", "research", "mentor", "general"])
- "tasks": a list of objects, each containing:
    * "agent": the target agent name
    * "description": brief action description
- "reason": a short explanation of the routing and planning choices (string)

Ensure all outputs are formatted as valid JSON. Do not return markdown blocks like ```json. Return raw JSON text only."""

        if self.llm and HAS_LANGCHAIN:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_instruction),
                    ("human", "User query: {query}")
                ])
                chain = prompt | self.llm
                result = chain.invoke({"query": query})
                cleaned = self.clean_json_response(result.content)
                parsed = json.loads(cleaned)
                return parsed
            except Exception as e:
                logger.error(f"Error in RouterAgent LLM run: {e}")
                pass

        try:
            res_content = self.call_gemini_http(system_instruction, f"User query: {query}")
            cleaned = self.clean_json_response(res_content)
            parsed = json.loads(cleaned)
            return parsed
        except Exception as e:
            logger.error(f"Error in RouterAgent HTTP run: {e}")
            return self._mock_route(query)

    def _mock_route(self, query: str) -> Dict[str, Any]:
        """Keyword matching fallback planner."""
        q = query.lower()
        if any(w in q for w in ["resume", "cv", "ats", "portfolio", "extracted_skills"]):
            agent = "resume"
            desc = "Analyze resume metrics and extract skills."
        elif any(w in q for w in ["job", "jd", "role", "description", "requirements"]):
            agent = "job"
            desc = "Match resume with job description and requirements."
        elif any(w in q for w in ["roadmap", "learn", "course", "study", "certificate", "skill gap"]):
            agent = "learning"
            desc = "Generate study roadmaps and skill gap milestones."
        elif any(w in q for w in ["interview", "question", "mock", "behavioral", "technical round", "hr"]):
            agent = "interview"
            desc = "Prepare mock interview questions and speech evaluation."
        elif any(w in q for w in ["company", "hiring", "google", "microsoft", "amazon", "meta", "research", "experience"]):
            agent = "research"
            desc = "Retrieve company research materials and interview rounds."
        else:
            agent = "general"
            desc = "Provide general career guidance and advice."

        # Support chaining for compound queries in mock
        tasks = [{"agent": agent, "description": desc}]
        if agent == "resume" and any(w in q for w in ["learn", "roadmap", "gap"]):
            tasks.append({"agent": "learning", "description": "Generate learning roadmap based on resume analysis."})
            
        return {
            "agent": agent,
            "tasks": tasks,
            "reason": f"Fallback matched query keywords: {query[:30]}..."
        }

