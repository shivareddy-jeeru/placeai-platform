import os
import logging
import requests
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)

# Try importing LangChain, fallback to standard HTTP if not present
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False
    logger.warning("LangChain packages not installed. BaseAgent will use direct HTTP requests to Gemini API.")

class BaseAgent(ABC):
    def __init__(self, model_name: str = "gemini-1.5-pro", temperature: float = 0.2, response_schema: Optional[Dict[str, Any]] = None):
        self.model_name = model_name
        # Map model name to standard Gemini API versions if running HTTP
        self.api_model_name = "gemini-1.5-flash" if "flash" in model_name else "gemini-1.5-pro"
        self.temperature = temperature
        self.response_schema = response_schema
        self.llm = None
        self._setup_llm()
        
    def _setup_llm(self):
        if not HAS_LANGCHAIN:
            return
            
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                model_kwargs = {}
                if self.response_schema:
                    model_kwargs["response_mime_type"] = "application/json"
                    model_kwargs["response_schema"] = self.response_schema

                self.llm = ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=api_key,
                    temperature=self.temperature,
                    model_kwargs=model_kwargs if model_kwargs else None
                )
                logger.info(f"Initialized LLM {self.model_name} for agent {self.__class__.__name__}")
            except Exception as e:
                logger.error(f"Failed to initialize ChatGoogleGenerativeAI for {self.__class__.__name__}: {e}")
                self.llm = None
        else:
            logger.warning(f"GEMINI_API_KEY not configured. {self.__class__.__name__} will run in fallback/mock mode.")

    @abstractmethod
    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the agent logic. Implement in subclasses."""
        pass
        
    def clean_json_response(self, text: str) -> str:
        """Helper to extract json string from markdown fenced block."""
        text_strip = text.strip()
        if text_strip.startswith("```"):
            text_strip = text_strip.replace("```json", "").replace("```", "").strip()
        return text_strip

    def call_gemini_http(self, system_instruction: str, human_message: str) -> str:
        """HTTP-based direct call to Google Gemini API when LangChain is missing."""
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.api_model_name}:generateContent?key={api_key}"
        
        gen_config = {
            "temperature": self.temperature,
            "responseMimeType": "application/json" if (self.response_schema or "JSON" in system_instruction) else "text/plain"
        }
        if self.response_schema:
            gen_config["responseSchema"] = self.response_schema

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": human_message}]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": gen_config
        }
        
        try:
            res = requests.post(url, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                logger.error(f"Gemini API returned status code {res.status_code}: {res.text}")
                raise Exception(f"Gemini API error: {res.text}")
        except Exception as e:
            logger.error(f"HTTP call to Gemini API failed: {e}")
            raise e
