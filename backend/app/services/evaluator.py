import os
import json
import logging
import requests
from typing import Dict, Any
from backend.app.config import settings

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import ChatPromptTemplate
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False
    logger = logging.getLogger(__name__)
    logger.warning("LangChain not installed. EvaluatorService will use direct HTTP API requests to Gemini.")

logger = logging.getLogger(__name__)

class EvaluatorService:
    def __init__(self):
        self.llm = None
        if HAS_LANGCHAIN:
            self._initialize_llm()

    def _initialize_llm(self):
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    google_api_key=api_key,
                    temperature=0.0
                )
            except Exception as e:
                logger.error(f"Failed to initialize evaluation LLM: {e}")
                self.llm = None

    def evaluate_response(self, query: str, context: str, response: str) -> Dict[str, Any]:
        """Evaluates relevance and hallucination score. Returns values between 1 and 5."""
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not self.llm and not api_key:
            return {
                "relevance_score": 4.5,
                "relevance_reason": "Offline / Mock Evaluation Mode.",
                "hallucination_score": 0.1,
                "hallucination_reason": "Offline / Mock Evaluation Mode."
            }

        prompt_system = """You are an AI Quality Assurance system analyzing Career Assistant responses.
Evaluate the response in two metrics:
1. Relevance (how well the response addresses the query using the context. Range: 1.0 to 5.0)
2. Hallucination (how much of the response contains claims not supported by the context. Range: 0.0 to 5.0, where 0.0 is perfect alignment and 5.0 is highly hallucinated/ungrounded).

Your output MUST be a valid JSON object with the following fields:
- relevance_score (float)
- relevance_reason (string)
- hallucination_score (float)
- hallucination_reason (string)

Do not output any markdown blocks (e.g. ```json) or leading/trailing text. Output raw JSON only."""

        prompt_human = f"""Context:
{context}

Query:
{query}

Generated Response:
{response}"""

        # 1. Use standard LangChain if available
        if self.llm and HAS_LANGCHAIN:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", prompt_system),
                ])
                chain = prompt | self.llm
                result = chain.invoke({"query": query, "context": context, "response": response})
                content = result.content.strip()
                return self._parse_json(content)
            except Exception as e:
                logger.error(f"Error in EvaluatorService standard LLM: {e}")
                # Fallback to HTTP
                pass

        # 2. Use HTTP direct call
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt_human}]}],
                "systemInstruction": {"parts": [{"text": prompt_system}]},
                "generationConfig": {"temperature": 0.0, "responseMimeType": "application/json"}
            }
            res = requests.post(url, json=payload)
            if res.status_code == 200:
                content = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                return self._parse_json(content)
            else:
                raise Exception(f"Gemini API returned status code {res.status_code}")
        except Exception as e:
            logger.error(f"HTTP call to Gemini Evaluator failed: {e}")
            return {
                "relevance_score": 4.0,
                "relevance_reason": f"Evaluation error: {str(e)}",
                "hallucination_score": 0.5,
                "hallucination_reason": f"Evaluation error: {str(e)}"
            }

    def _parse_json(self, content: str) -> Dict[str, Any]:
        content = content.strip()
        if content.startswith("```"):
            content = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(content)
        return {
            "relevance_score": float(data.get("relevance_score", 4.0)),
            "relevance_reason": str(data.get("relevance_reason", "N/A")),
            "hallucination_score": float(data.get("hallucination_score", 0.0)),
            "hallucination_reason": str(data.get("hallucination_reason", "N/A"))
        }

evaluator_service = EvaluatorService()
