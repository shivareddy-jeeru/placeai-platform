"""
Deterministic ATS Compatibility Scoring Engine and Job Description Match Engine
Calculates transparent, reproducible, dynamic resume metrics, section scores,
skill overlap, action verb counts, metrics detection, and JD compatibility.
Implements the exact documented 9-factor model:
  Contact 5%, Education 10%, Skills 20%, Projects 15%, Experience/Internship 15%,
  Certifications 10%, Keywords 15%, Formatting 5%, Section Completeness 5%. Total = 100%.
"""
import re
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Master Skill Taxonomy
SKILLS_TAXONOMY = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
    'HTML', 'CSS', 'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Express.js',
    'FastAPI', 'Django', 'Flask', 'Spring Boot', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST API', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git',
    'GitHub', 'CI/CD', 'Linux', 'Machine Learning', 'Deep Learning', 'NLP', 'Generative AI',
    'LLM', 'LangChain', 'TensorFlow', 'PyTorch', 'System Design', 'Data Structures', 'Algorithms',
    'Pandas', 'NumPy', 'Scikit-Learn', 'Tailwind', 'Bootstrap', 'Webpack', 'Vite',
    'Microservices', 'Jest', 'Pytest', 'Selenium', 'Kafka', 'RabbitMQ', 'Terraform', 'Ansible'
]

SECTION_KEYWORDS = {
    'summary': ['summary', 'objective', 'profile', 'about me', 'executive summary'],
    'skills': ['skills', 'technical skills', 'technologies', 'core competencies', 'stack', 'tools'],
    'education': ['education', 'academic', 'university', 'college', 'qualification', 'degree'],
    'experience': ['experience', 'work history', 'employment', 'work experience', 'professional background', 'career history', 'internship'],
    'projects': ['projects', 'personal projects', 'academic projects', 'portfolio', 'key projects'],
    'certifications': ['certifications', 'licenses', 'credentials', 'certifications & courses', 'certificate'],
    'achievements': ['achievements', 'awards', 'honors', 'accomplishments', 'recognition'],
    'languages': ['languages', 'spoken languages', 'linguistic skills']
}

ACTION_VERBS = [
    'developed', 'built', 'designed', 'implemented', 'architected', 'optimized',
    'automated', 'engineered', 'scaled', 'spearheaded', 'managed', 'created',
    'deployed', 'refactored', 'integrated', 'lead', 'improved', 'increased',
    'reduced', 'streamlined', 'launched', 'formulated', 'executed', 'orchestrated'
]

class ATSScorer:
    """Deterministic ATS Engine for parsing, scoring, and matching resumes."""

    def normalize(self, text: str) -> str:
        """Normalizes text for consistent token matching."""
        if not text:
            return ""
        return re.sub(r'\s+', ' ', re.sub(r'[^\w+#.]', ' ', text.lower())).strip()

    def detect_skills(self, text: str) -> List[str]:
        """Detects skills from master taxonomy present in normalized text."""
        norm_text = self.normalize(text)
        found = []
        for skill in SKILLS_TAXONOMY:
            norm_skill = self.normalize(skill)
            pattern = r'\b' + re.escape(norm_skill) + r'\b'
            if re.search(pattern, norm_text):
                display_name = 'Express.js' if skill == 'Express' else skill
                if display_name not in found:
                    found.append(display_name)
        return found

    def detect_action_verbs(self, text: str) -> List[str]:
        """Detects strong action verbs present in normalized text."""
        norm_text = self.normalize(text)
        found = []
        for verb in ACTION_VERBS:
            pattern = r'\b' + re.escape(verb) + r'\b'
            if re.search(pattern, norm_text):
                found.append(verb)
        return found

    def calculate_resume_ats_score(self, resume_text: str) -> Dict[str, Any]:
        """
        Calculates a transparent, reproducible deterministic 100-point Resume ATS Score.
        Documented weights:
          1. Contact Details: 5% (5 pts)
          2. Education: 10% (10 pts)
          3. Technical Skills: 20% (20 pts)
          4. Projects: 15% (15 pts)
          5. Experience / Internship: 15% (15 pts)
          6. Certifications & Achievements: 10% (10 pts)
          7. Keywords, Action Verbs & Metrics: 15% (15 pts)
          8. Formatting & Layout: 5% (5 pts)
          9. Section Completeness: 5% (5 pts)
        Total: 100 pts.
        """
        clean_text = resume_text.strip()
        norm_text = self.normalize(clean_text)
        word_count = len(clean_text.split())
        warnings = []
        strengths = []

        # Check for scanned or image-based PDF
        is_scanned_pdf = len(clean_text) < 80
        if is_scanned_pdf:
            warnings.append("This document appears to be scanned or image-based with little selectable text.")
            return {
                "resumeAtsScore": 0.0,
                "is_scanned_pdf": True,
                "breakdown": {
                    "contact": 0.0,
                    "education": 0.0,
                    "skills": 0.0,
                    "projects": 0.0,
                    "experience": 0.0,
                    "certifications": 0.0,
                    "keywords": 0.0,
                    "formatting": 0.0,
                    "sections": 0.0,
                    "readability": 0.0,
                    "achievements": 0.0
                },
                "detected_skills": [],
                "detected_sections": [],
                "metric_count": 0,
                "warnings": warnings,
                "strengths": []
            }

        # 1. Contact Information (Max 5 pts)
        has_email = bool(re.search(r'[\w.-]+@[\w.-]+\.\w+', clean_text))
        has_phone = bool(re.search(r'\+?\d[\d\s()\-]{8,15}\d', clean_text))
        has_linkedin = 'linkedin' in norm_text
        has_github_portfolio = any(k in norm_text for k in ['github', 'portfolio', 'http', 'gitlab'])

        contact_score = 0.0
        if has_email:
            contact_score += 2.0
        else:
            warnings.append("Missing contact email address.")

        if has_phone:
            contact_score += 1.5
        else:
            warnings.append("Missing contact phone number.")

        if has_linkedin or has_github_portfolio:
            contact_score += 1.5
            strengths.append("Contains professional online profiles (LinkedIn/GitHub).")
        else:
            warnings.append("Missing LinkedIn or GitHub/portfolio links.")

        # 2. Education (Max 10 pts)
        has_degree = any(e in norm_text for e in ['bachelor', 'master', 'btech', 'mtech', 'b.tech', 'm.tech', 'b.s', 'm.s', 'phd', 'degree', 'diploma'])
        has_institution = any(i in norm_text for i in ['university', 'college', 'institute', 'school', 'academy', 'stanford', 'berkeley', 'state'])
        has_grad_year = bool(re.search(r'\b(20\d{2}|19\d{2})\b', clean_text))

        education_score = 0.0
        if has_degree:
            education_score += 5.0
        if has_institution:
            education_score += 3.0
        if has_grad_year:
            education_score += 2.0

        if education_score >= 8.0:
            strengths.append("Clear educational background with degree and institution.")
        elif education_score == 0.0:
            warnings.append("No recognized university degree or academic qualification found.")

        # 3. Technical Skills (Max 20 pts)
        detected_skills = self.detect_skills(clean_text)
        skill_cnt = len(detected_skills)
        # Scaled: 10 skills = 20 pts
        skills_score = min(20.0, (skill_cnt / 10.0) * 20.0)
        if skill_cnt >= 7:
            strengths.append(f"Strong technical skill footprint ({skill_cnt} skills detected).")
        elif skill_cnt < 3:
            warnings.append("Few technical skills recognized from standard taxonomy. Add a dedicated Skills section.")

        # 4. Projects (Max 15 pts)
        has_project_heading = any(kw in norm_text for kw in SECTION_KEYWORDS['projects'])
        project_tech_mentions = sum(1 for s in detected_skills if s.lower() in norm_text)
        projects_score = 0.0
        if has_project_heading:
            projects_score += 7.5
        if project_tech_mentions >= 3:
            projects_score += 7.5
        elif project_tech_mentions > 0:
            projects_score += (project_tech_mentions / 3.0) * 7.5

        if projects_score >= 12.0:
            strengths.append("Demonstrated project portfolio with technical implementation details.")
        elif not has_project_heading:
            warnings.append("Missing dedicated Projects section.")

        # 5. Experience / Internship (Max 15 pts)
        has_exp_heading = any(kw in norm_text for kw in SECTION_KEYWORDS['experience'])
        has_exp_keywords = any(k in norm_text for k in ['intern', 'engineer', 'developer', 'analyst', 'associate', 'lead', 'manager', 'consultant', 'company'])
        exp_score = 0.0
        if has_exp_heading:
            exp_score += 7.5
        if has_exp_keywords:
            exp_score += 7.5

        if exp_score >= 12.0:
            strengths.append("Documented work or internship experience.")
        elif not has_exp_heading:
            warnings.append("Missing dedicated Experience or Internship section.")

        # 6. Certifications & Achievements (Max 10 pts)
        has_cert = any(kw in norm_text for kw in SECTION_KEYWORDS['certifications'])
        has_achieve = any(kw in norm_text for kw in SECTION_KEYWORDS['achievements'])
        cert_score = 0.0
        if has_cert:
            cert_score += 5.0
        if has_achieve:
            cert_score += 5.0
        if not has_cert and not has_achieve:
            # Check for general keywords
            if any(k in norm_text for k in ['certified', 'aws certified', 'coursera', 'hackathon', 'ranked', 'winner']):
                cert_score += 5.0

        # 7. Keywords, Action Verbs & Metrics (Max 15 pts)
        action_verbs_found = self.detect_action_verbs(clean_text)
        verb_cnt = len(action_verbs_found)
        verb_score = min(8.0, (verb_cnt / 6.0) * 8.0)

        metric_matches = re.findall(
            r'\b\d+(\.\d+)?\s?(%|x|users|records|ms|sec|seconds|projects|requests|days|months|years|k|m|b|\+)\b',
            clean_text, re.IGNORECASE
        )
        metric_count = len(metric_matches)
        metric_score = min(7.0, (metric_count / 3.0) * 7.0)

        keywords_score = verb_score + metric_score
        if metric_count >= 2:
            strengths.append(f"Quantifiable metrics detected ({metric_count} metrics) demonstrating measurable business impact.")
        else:
            warnings.append("Few quantifiable metrics found. Include concrete numbers (%, ms, latency, user counts).")

        if verb_cnt >= 4:
            strengths.append(f"Strong action verb density ({verb_cnt} action verbs).")
        else:
            warnings.append("Few impactful action verbs found (e.g., 'developed', 'architected', 'optimized').")

        # 8. Formatting & Layout Integrity (Max 5 pts)
        formatting_score = 5.0
        if word_count < 150:
            formatting_score -= 3.0
            warnings.append("Resume is unusually short (under 150 words). Provide more comprehensive details.")
        elif word_count > 1500:
            formatting_score -= 1.5
            warnings.append("Resume is lengthy (over 1500 words). Recommended length for college/junior roles is 1-2 pages.")

        # 9. Section Completeness (Max 5 pts)
        found_sections = []
        for section, kw_list in SECTION_KEYWORDS.items():
            if any(kw in norm_text for kw in kw_list):
                found_sections.append(section)

        core_sections = ['skills', 'education', 'experience', 'projects']
        core_present = sum(1 for s in core_sections if s in found_sections)
        sections_score = (core_present / 4.0) * 5.0

        # Calculate Total Deterministic ATS Score
        total_ats_score = (
            contact_score +
            education_score +
            skills_score +
            projects_score +
            exp_score +
            cert_score +
            keywords_score +
            formatting_score +
            sections_score
        )
        total_ats_score = min(100.0, max(0.0, total_ats_score))

        return {
            "resumeAtsScore": round(total_ats_score, 1),
            "is_scanned_pdf": False,
            "breakdown": {
                "contact": round(contact_score, 1),
                "education": round(education_score, 1),
                "skills": round(skills_score, 1),
                "projects": round(projects_score, 1),
                "experience": round(exp_score, 1),
                "certifications": round(cert_score, 1),
                "keywords": round(keywords_score, 1),
                "formatting": round(formatting_score, 1),
                "sections": round(sections_score, 1),
                "readability": round(formatting_score * 3.0, 1), # Compatibility alias
                "achievements": round(metric_score * (10.0 / 7.0), 1) # Compatibility alias
            },
            "detected_skills": detected_skills,
            "detected_sections": found_sections,
            "metric_count": metric_count,
            "warnings": warnings,
            "strengths": strengths
        }

    def calculate_job_match_score(self, resume_text: str, job_description_text: str) -> Dict[str, Any]:
        """
        Calculates a deterministic 100-point Job Description Match Score.
        Evaluates required skill overlap, technical keywords, title relevance,
        experience alignment, and produces missing vs matched skills.
        Weights:
          - Required Skill Coverage: 40 pts
          - Technical Keyword Alignment: 25 pts
          - Role & Title Alignment: 20 pts
          - Experience / Requirement Depth: 15 pts
        """
        if not job_description_text or not job_description_text.strip():
            return {
                "jobMatchScore": None,
                "breakdown": None,
                "matchedSkills": [],
                "missingSkills": [],
                "recommendations": ["Paste a target Job Description to generate a Job Match Score."]
            }

        resume_skills = set(self.detect_skills(resume_text))
        job_skills = set(self.detect_skills(job_description_text))

        matched_skills = sorted(list(resume_skills.intersection(job_skills)))
        missing_skills = sorted(list(job_skills - resume_skills))

        # 1. Required Skill Coverage (Max 40 pts)
        if job_skills:
            req_skill_score = (len(matched_skills) / len(job_skills)) * 40.0
        else:
            req_skill_score = 30.0

        # 2. Technical Keyword Alignment (Max 25 pts)
        norm_resume = self.normalize(resume_text)
        norm_jd = self.normalize(job_description_text)
        
        # Check presence of additional keywords
        extra_keywords = ['api', 'database', 'system design', 'testing', 'cloud', 'architecture', 'scalability', 'ci/cd', 'frontend', 'backend']
        jd_extra = [kw for kw in extra_keywords if kw in norm_jd]
        resume_extra = [kw for kw in jd_extra if kw in norm_resume]
        if jd_extra:
            keyword_score = (len(resume_extra) / len(jd_extra)) * 25.0
        else:
            keyword_score = 20.0

        # 3. Role & Title Relevance (Max 20 pts)
        title_matches = 0
        common_roles = ['software engineer', 'backend', 'frontend', 'full stack', 'developer', 'sde', 'data engineer', 'devops']
        for role in common_roles:
            if role in norm_jd and role in norm_resume:
                title_matches += 1
        role_score = 20.0 if title_matches > 0 else 12.0

        # 4. Experience & Requirement Alignment (Max 15 pts)
        exp_score = 15.0 if any(k in norm_resume for k in ['intern', 'engineer', 'developer', 'experience']) else 8.0

        total_match_score = min(100.0, max(0.0, req_skill_score + keyword_score + role_score + exp_score))

        recommendations = []
        if missing_skills:
            top_missing = missing_skills[:3]
            recommendations.append(f"Add key technical competencies missing from job description: {', '.join(top_missing)}.")
        if req_skill_score < 25.0:
            recommendations.append("Tailor your projects to demonstrate direct hands-on use of the primary tech stack.")
        if not recommendations:
            recommendations.append("Strong job description alignment! Prepare STAR scenario responses for interview rounds.")

        return {
            "jobMatchScore": round(total_match_score, 1),
            "breakdown": {
                "required_skills": round(req_skill_score, 1),
                "technical_keywords": round(keyword_score, 1),
                "role_relevance": round(role_score, 1),
                "experience_relevance": round(exp_score, 1)
            },
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "recommendations": recommendations
        }

ats_scorer = ATSScorer()
