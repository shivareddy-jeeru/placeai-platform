import re
from typing import List, Dict, Set, Any

# Standard Skill Alias Normalization Mapping
SKILL_ALIASES = {
    # Backend & Languages
    "py": "Python",
    "python3": "Python",
    "js": "JavaScript",
    "es6": "JavaScript",
    "ts": "TypeScript",
    "fastapi": "FastAPI",
    "fast-api": "FastAPI",
    "fast api": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "java": "Java",
    "springboot": "Spring Boot",
    "spring-boot": "Spring Boot",
    "spring boot": "Spring Boot",
    
    # Frontend
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    
    # Database
    "sql": "SQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "postgres-sql": "PostgreSQL",
    "mysql": "MySQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    
    # Cloud & DevOps
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "docker": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "kube": "Kubernetes",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "git": "Git",
    "github": "GitHub",
    
    # AI/ML & Concepts
    "dsa": "Data Structures & Algorithms",
    "data structures": "Data Structures & Algorithms",
    "algorithms": "Data Structures & Algorithms",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "ai": "Artificial Intelligence",
    "nlp": "Natural Language Processing",
    "rag": "RAG",
    "llm": "LLMs"
}

class SkillTaxonomyEngine:
    """Engine for normalizing skill names and computing explainable match metrics."""

    @staticmethod
    def normalize_skill(skill_name: str) -> str:
        """Normalizes a raw skill string to standard taxonomy canonical representation."""
        cleaned = re.sub(r"[^\w\s\.\/\#\-]", "", skill_name.strip()).lower()
        return SKILL_ALIASES.get(cleaned, skill_name.strip().title())

    @classmethod
    def normalize_skill_list(cls, skills: List[str]) -> List[str]:
        """Normalizes and deduplicates a list of skill strings."""
        if not skills:
            return []
        normalized_set = set()
        for s in skills:
            if s and s.strip():
                norm = cls.normalize_skill(s)
                normalized_set.add(norm)
        return sorted(list(normalized_set))

    @classmethod
    def calculate_explainable_match(
        cls,
        candidate_skills: List[str],
        job_skills: List[str],
        has_experience: bool = True,
        has_projects: bool = True
    ) -> Dict[str, Any]:
        """
        Computes an explainable, deterministic ATS match breakdown:
        Match = 0.40 * Skill + 0.25 * Keyword + 0.20 * Experience + 0.15 * Projects
        """
        norm_candidate = set(cls.normalize_skill_list(candidate_skills))
        norm_job = set(cls.normalize_skill_list(job_skills))

        matched_skills = list(norm_candidate & norm_job)
        missing_skills = list(norm_job - norm_candidate)

        if norm_job:
            skill_score = round((len(matched_skills) / len(norm_job)) * 100.0, 1)
        else:
            skill_score = 75.0

        keyword_score = round(min(max(skill_score * 0.95, 10.0), 98.0), 1)
        experience_score = 80.0 if has_experience else 50.0
        projects_score = 85.0 if has_projects else 50.0

        overall_match = round(
            (0.40 * skill_score) +
            (0.25 * keyword_score) +
            (0.20 * experience_score) +
            (0.15 * projects_score),
            1
        )

        return {
            "overall_match_score": overall_match,
            "skill_score": skill_score,
            "keyword_score": keyword_score,
            "experience_score": experience_score,
            "projects_score": projects_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills
        }

skill_taxonomy = SkillTaxonomyEngine()
