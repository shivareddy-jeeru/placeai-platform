import os
import logging
import re
import requests
import math
from typing import List, Dict, Any
from backend.app.config import settings

logger = logging.getLogger(__name__)

# Optional LangChain / Chroma imports
try:
    from langchain_community.vectorstores import Chroma
    from langchain_core.documents import Document
    from langchain_google_genai import GoogleGenAIEmbeddings
    HAS_VECTOR_DB = True
except ImportError:
    HAS_VECTOR_DB = False
    logger.warning("LangChain vectorDB modules not installed. RAGService will run in-memory keyword-search fallback mode.")
    class Document:
        def __init__(self, page_content: str, metadata: dict = None):
            self.page_content = page_content
            self.metadata = metadata or {}

class RAGService:
    def __init__(self):
        self.embeddings = None
        self.vector_store = None
        self.in_memory_docs = [] # Fallback corpus: list of dicts {"content": str, "metadata": dict}
        
        if HAS_VECTOR_DB:
            self._initialize_embeddings()
            self._initialize_vector_store()
        
    def _initialize_embeddings(self):
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return
        try:
            self.embeddings = GoogleGenAIEmbeddings(
                model="models/embedding-001",
                google_api_key=api_key
            )
        except Exception as e:
            logger.error(f"Failed to initialize embeddings: {e}")
            self.embeddings = None

    def _initialize_vector_store(self):
        persist_dir = settings.CHROMA_DB_DIR
        os.makedirs(persist_dir, exist_ok=True)
        try:
            if self.embeddings:
                self.vector_store = Chroma(
                    persist_directory=persist_dir,
                    embedding_function=self.embeddings,
                    collection_name="placement_assistant"
                )
                logger.info("ChromaDB vector store initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.vector_store = None

    def add_documents(self, texts: List[str], metadatas: List[Dict[str, Any]] = None):
        """Adds text chunks to vector store or fallback list."""
        for i, text in enumerate(texts):
            meta = metadatas[i] if metadatas and i < len(metadatas) else {}
            self.in_memory_docs.append({
                "content": text,
                "metadata": meta
            })
            
        if HAS_VECTOR_DB and self.vector_store:
            try:
                docs = [Document(page_content=t, metadata=m) for t, m in zip(texts, metadatas or [{}]*len(texts))]
                self.vector_store.add_documents(docs)
                logger.info(f"Added {len(docs)} chunks to ChromaDB.")
                return True
            except Exception as e:
                logger.error(f"Error adding to ChromaDB: {e}")
                # Don't fail: we have in_memory_docs active
                
        logger.info(f"Buffered {len(texts)} chunks in RAGService in-memory index.")
        return True

    def _expand_query(self, query: str) -> str:
        """Expands user query via Gemini HTTP request to improve retrieval match rate."""
        api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return query
            
        system_instruction = (
            "You are an advanced search query expander for a placement preparation assistant.\n"
            "Your task is to take a short user query and rewrite/expand it to improve document retrieval in a vector database.\n"
            "Generate search terms, synonyms, hiring rounds, tech stack components, or interview details related to the company/topic mentioned.\n"
            "Return only the expanded search query. Keep it under 25 words. Do not include formatting, brackets, or explanation.\n"
            "Example: 'Google rounds' -> 'Google software engineering recruitment process, coding interviews, system design rounds, behavioral assessment, hiring experiences'"
        )

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"Expand this query: {query}"}]}],
                "systemInstruction": {"parts": [{"text": system_instruction}]},
                "generationConfig": {"temperature": 0.0, "maxOutputTokens": 60}
            }
            res = requests.post(url, json=payload, timeout=5)
            if res.status_code == 200:
                expanded = res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                logger.info(f"Expanded query: '{query}' -> '{expanded}'")
                return expanded
        except Exception as e:
            logger.error(f"Query expansion failed: {e}")
        return query

    def query_similar(self, query: str, k: int = 4) -> List[Dict[str, Any]]:
        """Queries vector database, applies query expansion, and reranks candidate documents."""
        # 1. Expand search query
        expanded_query = self._expand_query(query)
        
        # Retrieve more candidates to allow reranking
        k_retrieve = k * 3
        results_with_scores = []
        
        if HAS_VECTOR_DB and self.vector_store:
            try:
                # Retrieve candidates with distances
                candidates = self.vector_store.similarity_search_with_score(expanded_query, k=k_retrieve)
                for doc, dist in candidates:
                    # Map distance to similarity (0.0 to 1.0)
                    semantic_sim = max(0.0, 1.0 - (dist / 2.0))
                    results_with_scores.append((doc, semantic_sim))
            except Exception as e:
                logger.error(f"Error querying ChromaDB: {e}")

        # Fallback keyword match search if vector db is empty or queries fail
        if not results_with_scores:
            logger.info("Running fallback in-memory search for candidates...")
            query_words = set(re.findall(r'\w+', expanded_query.lower()))
            if not query_words:
                return self.in_memory_docs[:k]
                
            scored_docs = []
            for doc in self.in_memory_docs:
                content_lower = doc["content"].lower()
                overlap = sum(1 for w in query_words if w in content_lower)
                scored_docs.append((overlap, doc))
            
            scored_docs.sort(key=lambda x: x[0], reverse=True)
            for score, doc in scored_docs[:k_retrieve]:
                sim = min(1.0, score / max(1, len(query_words)))
                results_with_scores.append((Document(page_content=doc["content"], metadata=doc["metadata"]), sim))

        # 2. Hybrid Reranking (60% Semantic + 40% Lexical overlap)
        reranked_docs = []
        query_terms = set(re.findall(r'\w+', query.lower() + " " + expanded_query.lower()))
        
        for doc, semantic_sim in results_with_scores:
            content_lower = doc.page_content.lower()
            lexical_overlap = 0
            for term in query_terms:
                if len(term) > 2: # Ignore short terms
                    lexical_overlap += content_lower.count(term)
            
            # Logarithmic scaling to prevent single word spamming from dominating the score
            lexical_score = math.log1p(lexical_overlap) / 5.0
            lexical_score = min(1.0, lexical_score)
            
            hybrid_score = (semantic_sim * 0.6) + (lexical_score * 0.4)
            reranked_docs.append((hybrid_score, doc))
            
        reranked_docs.sort(key=lambda x: x[0], reverse=True)
        return [{"content": d.page_content, "metadata": d.metadata} for _, d in reranked_docs[:k]]

rag_service = RAGService()

