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

class CriticAgent(BaseAgent):
    def __init__(self):
        super().__init__(model_name="gemini-1.5-flash", temperature=0.2)

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        query = inputs.get("query", "")
        raw_response = inputs.get("raw_response", "")
        target_agent = inputs.get("target_agent", "general")
        
        if not raw_response:
            return {"final_response": "I apologize, but I encountered an empty input to review."}

        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not self.llm and not api_key:
            return {"final_response": raw_response} # Passthrough mock fallback

        system_instruction = """You are a Career Assistant Critic and Reviewer Agent.
Your job is to audit, polish, and refine the raw assistant response to ensure it perfectly addresses the user's query, maintains a professional and empathetic tone, contains no spelling/formatting issues, and adheres to safety boundaries.

If the response mentions anything incorrect, fix it. If the formatting is broken (e.g. malformed lists or missing headers), clean it up.
Keep the style clear, actionable, and structured with bold highlights and clean lists where appropriate.

Your output MUST be a valid JSON object containing exactly these keys:
- "final_response": the polished final response text (string)
- "modifications_made": a list of short descriptions of what you modified (or an empty list if no changes were needed)

Ensure all outputs are formatted as valid JSON. Do not return markdown blocks like ```json. Return raw JSON text only."""

        human_prompt = f"User Query: {query}\n\nRaw Response to Review:\n{raw_response}\n\nTarget Agent Context: {target_agent}"

        if self.llm and HAS_LANGCHAIN:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_instruction),
                    ("human", human_prompt)
                ])
                chain = prompt | self.llm
                result = chain.invoke({})
                cleaned = self.clean_json_response(result.content)
                parsed = json.loads(cleaned)
                return parsed
            except Exception as e:
                logger.error(f"Error in CriticAgent LLM run: {e}")
                pass

        try:
            res_content = self.call_gemini_http(system_instruction, human_prompt)
            cleaned = self.clean_json_response(res_content)
            parsed = json.loads(cleaned)
            return parsed
        except Exception as e:
            logger.error(f"Error in CriticAgent HTTP run: {e}")
            return {"final_response": raw_response, "modifications_made": []}

critic_agent = CriticAgent()
