import json
import logging
import os
from typing import Dict, Any
from backend.app.agents.base import BaseAgent
from backend.app.services.rag import rag_service
from backend.app.config import settings

try:
    from langchain_core.prompts import ChatPromptTemplate
    HAS_LANGCHAIN = True
except ImportError:
    HAS_LANGCHAIN = False

logger = logging.getLogger(__name__)

class ResearchAgent(BaseAgent):
    def __init__(self):
        super().__init__(model_name="gemini-1.5-pro", temperature=0.2)

    def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        company_name = inputs.get("company_name", "").strip()
        if not company_name:
            return {"error": "Company name is required."}

        # Query RAG
        rag_context = ""
        try:
            rag_docs = rag_service.query_similar(company_name, k=3)
            if rag_docs:
                rag_context = "\n\n".join([
                    f"[Source: {doc['metadata'].get('source', 'Company Material')}]\n{doc['content']}"
                    for doc in rag_docs
                ])
                logger.info(f"Retrieved {len(rag_docs)} chunks for {company_name}")
        except Exception as e:
            logger.error(f"Error querying RAG context in ResearchAgent: {e}")

        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not self.llm and not api_key:
            return self._mock_research(company_name, rag_context)

        system_instruction = """You are a Company Intelligence Analyst. Generate a detailed placement dossier for the target company.
Use the retrieved context from internal placement guides or interview experiences if provided. If the context is empty, use your extensive pre-trained knowledge.

Your output MUST be a valid JSON object containing exactly these keys:
- "company_name": Name of the company.
- "overview": High-level description of what the company does.
- "products": Core products, services, or divisions (list of strings).
- "developments": Recent news or tech innovations (list of strings).
- "interview_experiences": Summary of interview formats, rounds, and tips (list of strings).
- "hiring_trends": Hiring seasons, cutoff GPA, and expectations (list of strings).

Ensure all outputs are formatted as valid JSON. Do not return markdown blocks like ```json. Return raw JSON text only."""

        human_msg = f"Company Name: {company_name}\n\nRetrieved RAG Context:\n{rag_context or 'No context available.'}"

        if self.llm and HAS_LANGCHAIN:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_instruction),
                    ("human", human_msg)
                ])
                chain = prompt | self.llm
                result = chain.invoke({
                    "company_name": company_name,
                    "context": rag_context or "No specific placement logs found. Generate using general knowledge."
                })
                cleaned = self.clean_json_response(result.content)
                parsed = json.loads(cleaned)
                parsed["context_used"] = rag_context
                return parsed
            except Exception as e:
                logger.error(f"Error in ResearchAgent LLM run: {e}")
                pass

        try:
            res_content = self.call_gemini_http(system_instruction, human_msg)
            cleaned = self.clean_json_response(res_content)
            parsed = json.loads(cleaned)
            parsed["context_used"] = rag_context
            return parsed
        except Exception as e:
            logger.error(f"Error in ResearchAgent HTTP run: {e}")
            return self._mock_research(company_name, rag_context)

    def _mock_research(self, company: str, context: str) -> Dict[str, Any]:
        """Fallback company dossier generator."""
        return {
            "company_name": company,
            "overview": f"A leading technology firm operating globally, recognized for innovations in software systems, cloud infrastructure, and AI systems.",
            "products": [
                "Enterprise Cloud Services",
                "Advanced AI Search Engines",
                "Developer Tooling and IDEs"
            ],
            "developments": [
                "Launched next-generation generative models integrating multi-modal capabilities.",
                "Expanded regional cloud data centers to reduce latency in global markets."
            ],
            "interview_experiences": [
                "Typically consists of 1 Online Coding Assessment (2-3 DS/Algo problems on graphs/trees).",
                "2 Technical Rounds focused on system design, database schemas, concurrency, and OOP concepts.",
                "1 Behavioral Round assessing team collaboration and leadership principles (STAR method highly recommended)."
            ] + ([f"From local archive: {context[:200]}..."] if context else []),
            "hiring_trends": [
                "Actively hires Software Engineering Interns during spring semesters.",
                "Maintains a GPA cutoff of 7.5/10 or 3.2/4.0 for shortlisting campus applicants.",
                "High emphasis on solid understanding of operating systems, databases, and network fundamentals."
            ],
            "context_used": context
        }
