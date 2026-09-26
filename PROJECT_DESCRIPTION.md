# Project Description: AI-Powered Placement Assistant

This document provides a highly polished, professional project description suitable for your **Software Engineering Resume**, **LinkedIn Profile**, and for answering **Technical Interview Questions** regarding the application's architecture and design decisions.

---

## 📄 For Your Resume (Bullet Points)

**AI-Powered Placement Assistant (Full-Stack Multi-Agent AI System)** | *Python, FastAPI, Streamlit, LangChain, Gemini, ChromaDB, SQLAlchemy, PostgreSQL, Docker*
- Engineered a production-ready career preparation platform enabling ATS resume scoring, job compatibility alignment, skill gap roadmapping, and interactive mock interviews.
- Designed a **Multi-Agent Routing Architecture** with LangChain to classify user query intent and dispatch requests to specialized sub-agents (Resume, Job, Study, Interview, and Research agents), reducing context-overlap and model hallucinations.
- Developed a **Retrieval-Augmented Generation (RAG) Pipeline** utilizing Google GenAI Embeddings and ChromaDB to ingest, split, and search historical student placement guides and company interview logs, enriching prompt context in real-time.
- Implemented an **AI Evaluation Framework** performing real-time quality assurance on responses, outputting Relevance and Hallucination grounding indices (1.0 to 5.0) using structured system scoring.
- Constructed a secure authentication backend using **JWT (JSON Web Tokens)** and mockable Google Social Login flows on top of a relational database (SQLAlchemy models for PostgreSQL/SQLite) tracking user resumes, metrics, and chat histories.
- Containerized the full-stack architecture using **Docker** and **Docker Compose**, optimizing build layers for instant multi-service cloud deployments.

---

## 💼 For Your LinkedIn Profile / Portfolio Description

🚀 **New Project Release: AI-Powered Placement Assistant** 🥇

Technical recruitment prep is hard, so I built an intelligent, full-stack career platform designed to help students optimize their placement preparations using multi-agent architectures and RAG pipelines.

Here is a breakdown of the technical stack and systems I built:
- **FastAPI Backend**: Powered by JWT security, handling multi-agent workflows and SQLAlchemy ORM bindings supporting PostgreSQL and SQLite fallbacks.
- **Streamlit Frontend**: A sleek, dark-themed dashboard featuring interactive metrics, Plotly skill radar charts, resume file upload parsing, and live chat layouts.
- **Multi-Agent Coordination**: Implemented a router that classifies inputs and triggers specialized sub-agents (Resume, Job, Roadmap, Interview, and Company Research).
- **RAG Pipeline**: Embedded and indexed placement guides and interview experiences into a local ChromaDB instance to provide grounded context.
- **AI Quality Evaluation**: Responses are audited on the fly for relevance and hallucination indicators, providing instant feedback on answers.

Check out the code on GitHub! 💻👇
*(Link to repository)*

---

## 💬 Interview Q&A Cheatsheet (For Your Technical Rounds)

### Q1: Why did you choose a Multi-Agent system rather than a single large LLM prompt?
> **Answer**: "A single prompt attempting to parse a resume, evaluate a job description, construct a learning roadmap, and act as a mock interviewer suffers from prompt drift and high latency. By dividing these responsibilities, I created specialized agents with optimized system instructions. The Router Agent classifies user intent with high efficiency, invoking the correct agent sub-chain. This keeps prompts short, lowers token cost, increases response speeds, and minimizes hallucination rates."

### Q2: How did you implement RAG and handle vector retrieval?
> **Answer**: "I used LangChain to structure the RAG pipeline. During application startup, a background worker checks the database. If it's empty, it reads plain-text guide materials, splits them using a `RecursiveCharacterTextSplitter` into 800-character chunks with a 150-character overlap, and embeds them via Google's `models/embedding-001`. The embeddings are stored in a persistent local ChromaDB instance. When a user asks about a company's hiring rounds, the agent queries ChromaDB for the top 3 similar chunks to inject into the LLM context, guaranteeing answers are grounded in historical records."

### Q3: What is the purpose of the Evaluation service?
> **Answer**: "In production LLM applications, monitoring quality is critical. I built a real-time evaluator service that acts as an LLM judge. After the coordinator agent compiles a response, the Evaluator Service receives the user's query, the retrieved RAG context, and the generated response. It runs a zero-temperature prompt on a Flash model to score two metrics: Relevance and Hallucination (grounding check) from 1.0 to 5.0. These indices are displayed on the frontend, allowing candidates to monitor how closely the assistant relies on factual documents versus general knowledge."

### Q4: How is database portability achieved in this stack?
> **Answer**: "I used SQLAlchemy's declarative base modeling. The application checks the `DATABASE_URL` environment variable. If it isn't defined, it defaults to a local SQLite database (`sqlite:///./placement_assistant.db`), enabling zero-setup running for recruiters or developers clone-testing the code. In production, by simply swapping the env variable to a PostgreSQL connection string, SQLAlchemy automatically connects to Postgres, creating the tables on startup without code changes."
