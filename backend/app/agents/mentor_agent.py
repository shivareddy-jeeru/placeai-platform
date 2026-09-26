import logging
import json
from typing import Dict, Any, Optional
from backend.app.agents.base import BaseAgent

logger = logging.getLogger(__name__)

class MentorAgent(BaseAgent):
    """AI Mentor Agent that reads candidate session state and answers strategic preparation questions."""

    def __init__(self):
        super().__init__(
            model_name="gemini-1.5-pro",
            temperature=0.3
        )

    def guide_student(self, user_query: str, session_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a personalized response based on the candidate's exact resume/job/skill gap state."""
        resume_data = session_context.get("resume") or {}
        job_data = session_context.get("job") or {}
        match_data = session_context.get("match") or {}
        roadmap_data = session_context.get("roadmap") or {}
        interview_data = session_context.get("interview") or {}

        ats_score = resume_data.get("ats_score", "Not Evaluated")
        skills = resume_data.get("skills") or resume_data.get("extracted_skills") or []
        target_role = job_data.get("title") or "Software Engineer"
        match_pct = match_data.get("compatibility_score") or match_data.get("match_percentage", "Not Matched")
        missing_skills = match_data.get("missing_skills") or []

        prompt = f"""
You are the PlaceAI Senior Career Mentor. You guide students and candidate software engineers through technical recruitment preparation.

CURRENT CANDIDATE PREPARATION STATE:
- ATS Resume Score: {ats_score}
- Candidate Extracted Skills: {skills}
- Target Role: {target_role}
- Job Compatibility Match: {match_pct}%
- Identified Skill Gaps (Missing): {missing_skills}
- Active Roadmap Module Count: {len(roadmap_data.get('roadmap', [])) if isinstance(roadmap_data, dict) else 0}
- Mock Interview Status: {interview_data.get('overall_score', 'Not Started')}

CANDIDATE QUESTION: "{user_query}"

INSTRUCTIONS:
1. Provide direct, actionable advice referencing their exact stats and missing skills.
2. If ATS score or Job Match is low or missing, guide them on what step to take next (e.g. "Upload resume", "Paste target job description", "Complete Module 1 of Docker").
3. Keep the tone encouraging, professional, and structured with bullet points.
4. Return a JSON object with:
   - "advice": string (formatted response text)
   - "next_recommended_action": string
   - "top_focus_skill": string
"""

        system_instruction = "You are an expert AI Placement Mentor. Respond with structured JSON containing 'advice', 'next_recommended_action', and 'top_focus_skill'."

        try:
            response_text = self._call_llm(prompt, system_instruction=system_instruction)
            cleaned_json = self._clean_json_response(response_text)
            parsed = json.loads(cleaned_json)
            return parsed
        except Exception as e:
            logger.error(f"Error in MentorAgent: {e}")
            return {
                "advice": f"Based on your profile ({match_pct}% match for {target_role}), focus on bridging your key missing skills: {', '.join(missing_skills) if missing_skills else 'Upload target job description'}. Complete your next learning roadmap module to boost your interview readiness!",
                "next_recommended_action": "Complete roadmap module",
                "top_focus_skill": missing_skills[0] if missing_skills else "Technical Practice"
            }

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Implement the abstract run method from BaseAgent."""
        user_query = inputs.get("user_query") or inputs.get("query") or ""
        session_context = inputs.get("session_context") or {}
        return self.guide_student(user_query, session_context)
