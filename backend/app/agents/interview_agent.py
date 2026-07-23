import json
import logging
import os
from typing import Dict, Any, Optional
from backend.app.agents.base import BaseAgent
from backend.app.config import settings

try:
    from langchain_core.prompts import ChatPromptTemplate
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

logger = logging.getLogger(__name__)

INTERVIEW_RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "questions": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "question": {
                        "type": "STRING",
                        "description": "The mock interview question."
                    },
                    "answer": {
                        "type": "STRING",
                        "description": "Structured guide or model answer outline (must explain how to structure answers, utilizing STAR method for behavioral queries)."
                    },
                    "category": {
                        "type": "STRING",
                        "description": "Must be one of: 'Technical', 'HR', 'Behavioral', or 'Project-based'."
                    },
                    "difficulty": {
                        "type": "STRING",
                        "description": "Must be one of: 'Beginner', 'Intermediate', or 'Advanced'."
                    }
                },
                "required": ["question", "answer", "category", "difficulty"]
            }
        },
        "thought_process": {
            "type": "STRING",
            "description": "Internal explanation detailing the logic behind choosing these questions."
        }
    },
    "required": ["questions", "thought_process"]
}

class InterviewAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            model_name="gemini-1.5-flash",
            temperature=0.4,
            response_schema=INTERVIEW_RESPONSE_SCHEMA
        )

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        topic = inputs.get("topic", "Software Engineer")
        difficulty = inputs.get("difficulty", "Intermediate")
        job_text = inputs.get("job_text", "")
        num_questions = inputs.get("num_questions", 5)

        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not self.llm and not api_key:
            return {"questions": self._mock_questions(topic, difficulty, num_questions)}

        system_instruction = """You are an elite Interview Coach. Generate a comprehensive list of interview questions with model answers.
Target the following details:
- Topic: {topic}
- Difficulty Level: {difficulty}
- Target Job Description details (if any): {job_text}
- Total Questions requested: {num_questions}

Explain your question curation strategy in the "thought_process" key first, detailing why these questions are critical for the role.

Divide the questions across categories: Technical, HR, Behavioral (using the STAR method), and Project-based. Each question must match the defined schema."""

        human_msg = f"Generate {num_questions} interview questions for {topic} ({difficulty} level)."

        if self.llm and HAS_LANGCHAIN:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_instruction),
                    ("human", human_msg)
                ])
                chain = prompt | self.llm
                result = chain.invoke({
                    "topic": topic,
                    "difficulty": difficulty,
                    "job_text": job_text,
                    "num_questions": num_questions
                })
                cleaned = self.clean_json_response(result.content)
                parsed = json.loads(cleaned)
                return parsed
            except Exception as e:
                logger.error(f"Error in InterviewAgent LLM run: {e}")
                pass

        try:
            # Re-format instructions to substitute values for HTTP
            sys_formatted = system_instruction.format(
                topic=topic,
                difficulty=difficulty,
                job_text=job_text or "None",
                num_questions=num_questions
            )
            res_content = self.call_gemini_http(sys_formatted, human_msg)
            cleaned = self.clean_json_response(res_content)
            parsed = json.loads(cleaned)
            return parsed
        except Exception as e:
            logger.error(f"Error in InterviewAgent HTTP run: {e}")
            return {"questions": self._mock_questions(topic, difficulty, num_questions)}

    def _mock_questions(self, topic: str, difficulty: str, count: int) -> list:
        """Fallback interview questions generator."""
        generic_questions = [
            {
                "question": "What is the difference between a list and a tuple in Python?",
                "answer": "Lists are mutable, meaning their values can be modified after creation. They are initialized with brackets []. Tuples are immutable, meaning they cannot be altered after creation. They are initialized with parentheses (). Tuples are typically faster and consume less memory.",
                "category": "Technical",
                "difficulty": "Beginner"
            },
            {
                "question": "Describe a conflict you had with a team member and how you resolved it.",
                "answer": "Use the STAR method: Situation (describe context), Task (explain your responsibility), Action (what specific actions you took to communicate and compromise), and Result (the positive outcomes like successful delivery and improved communication channels).",
                "category": "Behavioral",
                "difficulty": "Intermediate"
            },
            {
                "question": "How do you ensure application performance when executing heavy SQL database queries?",
                "answer": "Optimize databases by creating indexes on frequently queried fields, avoiding wildcard SELECT * calls, utilizing connection pools, caching database queries using Redis, and profiling slow query executions with EXPLAIN ANALYZE.",
                "category": "Technical",
                "difficulty": "Advanced"
            },
            {
                "question": "Walk me through the architecture of a key project you built.",
                "answer": "Describe the frontend framework (e.g., Streamlit, React), backend (FastAPI), database (PostgreSQL), and any caching or message broker queues. Outline key data flows, security patterns (JWT tokens), and deployment architectures.",
                "category": "Project-based",
                "difficulty": "Intermediate"
            },
            {
                "question": "Why do you want to join our organization?",
                "answer": "Align your personal career objectives and skill growth with the company's products, engineering culture, recent public accomplishments, and core missions.",
                "category": "HR",
                "difficulty": "Beginner"
            }
        ]
        return (generic_questions * (count // len(generic_questions) + 1))[:count]

    def evaluate_answer(self, question: str, answer: str, job_text: Optional[str] = "") -> Dict[str, Any]:
        """Evaluates a candidate's answer using Gemini and returns scores and recommendations."""
        import os
        from typing import Optional
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not self.llm and not api_key:
            return self._mock_evaluation(question, answer)

        system_instruction = """You are an expert technical interviewer and communication coach.
Evaluate the candidate's response to the interview question.
Consider:
- Technical Accuracy
- Communication Clarity
- Relevance to the role/job description (if provided)
- Structure of the answer (e.g. STAR format for behavioral questions)
- Confidence and completeness

Return a valid JSON object with the following fields:
- "score": A rating out of 10.0 (float)
- "strengths": A list of things they did well (list of strings)
- "weaknesses": A list of areas for improvement (list of strings)
- "improved_answer": A revised and polished version of their response illustrating how it could be better structured.
- "next_question": A follow-up or next logical interview question based on the topic.

Do not output any markdown formatting (e.g. ```json). Output raw JSON only."""

        human_msg = f"Question: {question}\nCandidate Answer: {answer}\nJob Details: {job_text or 'None'}"

        if self.llm and HAS_LANGCHAIN:
            try:
                from langchain_core.prompts import ChatPromptTemplate
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_instruction),
                    ("human", human_msg)
                ])
                chain = prompt | self.llm
                result = chain.invoke({
                    "question": question,
                    "answer": answer,
                    "job_text": job_text
                })
                cleaned = self.clean_json_response(result.content)
                return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Error in evaluate_answer LLM run: {e}")
                pass

        try:
            res_content = self.call_gemini_http(system_instruction, human_msg)
            cleaned = self.clean_json_response(res_content)
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Error in evaluate_answer HTTP run: {e}")
            return self._mock_evaluation(question, answer)

    def _mock_evaluation(self, question: str, answer: str) -> Dict[str, Any]:
        return {
            "score": 7.5,
            "strengths": ["Answer is clear and covers basic concepts."],
            "weaknesses": ["Could be more structured using STAR format.", "Could add more specific technical details."],
            "improved_answer": f"Here is a polished answer structure: [Polished version of: {answer}]",
            "next_question": "Can you explain how you would handle this concept in a production environment?"
        }
