"""
Deterministic ATS Compatibility Scoring Engine and Job Description Match Engine
Calculates transparent, reproducible, dynamic resume metrics, section scores,
skill overlap, action verb counts, metrics detection, and JD compatibility.
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
    'Pandas', 'NumPy', 'Scikit-Learn', 'Tailwind', 'Bootstrap', 'Webpack', 'Vite', 'GraphQL',
    'Microservices', 'Jest', 'Pytest', 'Selenium', 'Kafka', 'RabbitMQ', 'Terraform', 'Ansible'
]

SECTION_KEYWORDS = {
    'summary': ['summary', 'objective', 'profile', 'about me', 'executive summary'],
    'skills': ['skills', 'technical skills', 'technologies', 'core competencies', 'stack', 'tools'],
    'education': ['education', 'academic', 'university', 'college', 'qualification', 'degree'],
    'experience': ['experience', 'work history', 'employment', 'work experience', 'professional background', 'career history'],
    'projects': ['projects', 'personal projects', 'academic projects', 'portfolio', 'key projects'],
    'certifications': ['certifications', 'licenses', 'credentials', 'certifications & courses'],
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
        Calculates a dynamic, multi-tiered deterministic 100-point Resume ATS Score.
        Evaluates length, section coverage, contact links, skill density, action verbs,
        quantified impact metrics, education, and formatting integrity.
        """
        clean_text = resume_text.strip()
        norm_text = self.normalize(clean_text)
        word_count = len(clean_text.split())
        warnings = []

        # 1. ATS Readability & Content Depth (Max 15 pts)
        is_scanned_pdf = len(clean_text) < 80
        if is_scanned_pdf:
            readability_score = 0
            warnings.append("This PDF appears to be scanned or image-based. Text content could not be extracted cleanly.")
        elif word_count >= 350:
            readability_score = 15
        elif word_count >= 200:
            readability_score = 11
        elif word_count >= 100:
            readability_score = 7
        else:
            readability_score = 4
            warnings.append("Resume content is very brief (under 100 words). Add detail to your experience & projects.")

        # 2. Standard Sections Detection (Max 15 pts)
        found_sections = []
        for section, kw_list in SECTION_KEYWORDS.items():
            if any(kw in norm_text for kw in kw_list):
                found_sections.append(section)

        # 8 possible sections
        sections_ratio = len(found_sections) / len(SECTION_KEYWORDS)
        sections_score = round(sections_ratio * 15)

        missing_core_sections = [s for s in ['skills', 'experience', 'education', 'projects'] if s not in found_sections]
        if missing_core_sections:
            warnings.append(f"Missing core section headings: {', '.join(missing_core_sections)}.")

        # 3. Contact Information (Max 10 pts)
        contact_score = 0
        has_email = bool(re.search(r'[\w.-]+@[\w.-]+\.\w+', clean_text))
        has_phone = bool(re.search(r'\+?\d[\d\s()\-]{8,15}\d', clean_text))
        has_linkedin = 'linkedin' in norm_text
        has_github_portfolio = any(k in norm_text for k in ['github', 'portfolio', 'http', 'gitlab'])

        if has_email:
            contact_score += 3
        else:
            warnings.append("Missing contact email address.")

        if has_phone:
            contact_score += 3
        else:
            warnings.append("Missing contact phone number.")

        if has_linkedin:
            contact_score += 2
        else:
            warnings.append("Missing LinkedIn profile link.")

        if has_github_portfolio:
            contact_score += 2
        else:
            warnings.append("Missing GitHub or personal portfolio link.")

        # 4. Technical Skill Density & Quality (Max 15 pts)
        detected_skills = self.detect_skills(clean_text)
        skill_cnt = len(detected_skills)
        if skill_cnt >= 15:
            skills_score = 15
        elif skill_cnt >= 10:
            skills_score = 13
        elif skill_cnt >= 7:
            skills_score = 10
        elif skill_cnt >= 4:
            skills_score = 7
        elif skill_cnt >= 1:
            skills_score = 4
        else:
            skills_score = 1
            warnings.append("No technical skills detected from taxonomy. Add a dedicated Skills section.")

        # 5. Experience & Action Verbs (Max 15 pts)
        action_verbs_found = self.detect_action_verbs(clean_text)
        verb_cnt = len(action_verbs_found)
        if verb_cnt >= 8:
            exp_score = 15
        elif verb_cnt >= 5:
            exp_score = 12
        elif verb_cnt >= 3:
            exp_score = 9
        elif verb_cnt >= 1:
            exp_score = 6
        else:
            exp_score = 3
            warnings.append("Few impact action verbs found (e.g. 'developed', 'architected', 'optimized'). Use action-oriented bullet points.")

        # 6. Quantified Impact Metrics (Max 10 pts)
        # Matches numbers followed by %, x, ms, sec, users, records, requests, etc.
        metric_matches = re.findall(
            r'\b\d+(\.\d+)?\s?(%|x|users|records|ms|sec|seconds|projects|requests|days|months|years|k|m|b|\+)\b',
            clean_text, re.IGNORECASE
        )
        metric_count = len(metric_matches)
        if metric_count >= 5:
            achievements_score = 10
        elif metric_count >= 3:
            achievements_score = 7
        elif metric_count >= 1:
            achievements_score = 4
        else:
            achievements_score = 0
            warnings.append("No measurable metrics found in bullet points (e.g., 'improved speed by 35%'). Add quantified results.")

        # 7. Education & Degree Qualification (Max 5 pts)
        has_edu = any(e in norm_text for e in ['bachelor', 'master', 'btech', 'mtech', 'b.tech', 'm.tech', 'b.s', 'm.s', 'phd', 'university', 'college', 'institute', 'degree'])
        education_score = 5 if has_edu else 0
        if not has_edu:
            warnings.append("No degree or university qualification detected.")

        # 8. Formatting & Warnings Penalty (Max 15 pts base)
        formatting_base = 15
        deductions = len(warnings) * 2
        formatting_score = max(2, formatting_base - deductions)

        # Total ATS Score calculation
        total_ats_score = min(100.0, readability_score + sections_score + contact_score + skills_score + exp_score + achievements_score + education_score + formatting_score)

        return {
            "resumeAtsScore": round(total_ats_score, 1),
            "is_scanned_pdf": is_scanned_pdf,
            "breakdown": {
                "readability": readability_score,
                "sections": sections_score,
                "contact": contact_score,
                "skills": skills_score,
                "experience": exp_score,
                "achievements": achievements_score,
                "education": education_score,
                "formatting": formatting_score
            },
            "detected_skills": detected_skills,
            "detected_sections": found_sections,
            "metric_count": metric_count,
            "warnings": warnings
        }

    def calculate_job_match_score(self, resume_text: str, job_description_text: str) -> Dict[str, Any]:
        """
        Calculates a deterministic 100-point Job Description Match Score.
        Evaluates required skill overlap, technical keywords, title relevance,
        experience alignment, and produces missing vs matched skills.
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

        # 1. Required Skill Coverage (35 pts)
        if job_skills:
            req_skill_score = round((len(matched_skills) / len(job_skills)) * 35, 1)
        else:
            req_skill_score = 22.0

        # 2. Technical Keyword Match (25 pts)
        norm_resume = self.normalize(resume_text)
        norm_job = self.normalize(job_description_text)
        
        job_keywords = set(w for w in norm_job.split() if len(w) >= 4 and w not in ['with', 'that', 'from', 'this', 'have', 'your', 'will', 'about', 'must'])
        matched_kw = [kw for kw in job_keywords if kw in norm_resume]
        
        if job_keywords:
            keyword_score = round(min(25.0, (len(matched_kw) / len(job_keywords)) * 30.0), 1)
        else:
            keyword_score = 15.0

        # 3. Role / Title Relevance (15 pts)
        titles = ['software engineer', 'backend developer', 'frontend developer', 'fullstack developer', 'data engineer', 'devops engineer', 'analyst']
        job_title = "Software Engineer"
        for t in titles:
            if t in norm_job:
                job_title = t
                break
        
        title_score = 15.0 if job_title in norm_resume else 8.0

        # 4. Experience Relevance (10 pts)
        exp_score = 10.0 if any(k in norm_resume for k in ['experience', 'project', 'developed', 'built', 'implemented']) else 4.0

        # 5. Education Alignment (5 pts)
        edu_score = 5.0 if any(k in norm_resume for k in ['degree', 'bachelor', 'master', 'btech', 'mtech', 'computer science']) else 2.0

        # 6. Preferred Skill Coverage & Context (10 pts total)
        pref_score = 5.0 if len(matched_skills) >= 2 else 2.0
        context_score = 5.0 if len(matched_kw) >= 5 else 2.0

        total_match_score = min(100.0, req_skill_score + keyword_score + title_score + exp_score + edu_score + pref_score + context_score)

        recommendations = []
        if missing_skills:
            recommendations.append(f"Add missing key technologies to your resume: {', '.join(missing_skills[:4])}.")
        if title_score < 15.0:
            recommendations.append(f"Align your profile title and summary to match the target role: '{job_title.title()}'.")
        if keyword_score < 20.0:
            recommendations.append("Incorporate specific tools, frameworks, and buzzwords from the job description into your experience bullet points.")

        return {
            "jobMatchScore": round(total_match_score, 1),
            "breakdown": {
                "required_skills": req_skill_score,
                "technical_keywords": keyword_score,
                "title_relevance": title_score,
                "experience_relevance": exp_score,
                "education_alignment": edu_score,
                "preferred_skills": pref_score,
                "context_relevance": context_score
            },
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "matchedKeywords": matched_kw[:10],
            "missingKeywords": [kw for kw in list(job_keywords) if kw not in matched_kw][:10],
            "recommendations": recommendations
        }

ats_scorer = ATSScorer()
