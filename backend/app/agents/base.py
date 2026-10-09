import os
import json
import logging
import requests
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(
        self,
        model_name: str = "openai/gpt-oss-20b",  # Default fast model for Groq
        temperature: float = 0.2,
        response_schema: Optional[Dict[str, Any]] = None
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.response_schema = response_schema

    @abstractmethod
    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the agent logic. Implement in subclasses."""
        pass

    def clean_json_response(self, text: str) -> str:
        """Helper to extract json string from markdown fenced block or messy output."""
        text_strip = text.strip()
        # Find first { or [
        start_idx_obj = text_strip.find("{")
        start_idx_arr = text_strip.find("[")
        
        if start_idx_obj == -1 and start_idx_arr == -1:
            return text_strip
            
        start_idx = start_idx_obj if start_idx_arr == -1 else (start_idx_arr if start_idx_obj == -1 else min(start_idx_obj, start_idx_arr))
        
        # Find last } or ]
        end_idx_obj = text_strip.rfind("}")
        end_idx_arr = text_strip.rfind("]")
        
        end_idx = max(end_idx_obj, end_idx_arr)
        
        if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
            return text_strip[start_idx:end_idx+1]
            
        return text_strip

    def call_groq_http(self, system_instruction: str, human_message: str) -> str:
        """HTTP-based direct call to Groq API using OpenAI compatible endpoints."""
        api_key = (settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")).strip()
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured.")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Ensure we strictly request JSON if there is a schema
        if self.response_schema or "JSON" in system_instruction:
            system_instruction += "\n\nCRITICAL: You MUST respond ONLY with valid JSON. Do not include any conversational text, markdown formatting like ```json, or explanations before or after the JSON."

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": human_message}
            ],
            "temperature": self.temperature
        }
        
        # Groq supports json_object response format
        if self.response_schema or "JSON" in system_instruction:
            payload["response_format"] = {"type": "json_object"}

        try:
            res = requests.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"]
            else:
                logger.error(f"Groq API returned status code {res.status_code}: {res.text}")
                raise Exception(f"Groq API error: {res.text}")
        except Exception as e:
            logger.error(f"HTTP call to Groq API failed: {e}")
            raise e
