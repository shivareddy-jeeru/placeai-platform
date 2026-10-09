# PlaceAI Production Readiness & Security Plan Tracker

## 4. Critical Changes – P0

### 4.1 Authentication & User Identity
- [ ] Implement proper authentication and assign every student a unique `user_id`.
- [ ] Store the student profile in the backend/database.
- [ ] Associate resumes, ATS results, skills, job matches, interview attempts, roadmap progress, readiness, and achievements with the authenticated user.
- [ ] Do not use localStorage as the source of truth for identity or application data.
- [ ] Use localStorage only for non-sensitive UI preferences or temporary state.

### 4.2 Authorization & Data Isolation
- [ ] Every protected API must verify the authenticated user's ownership of the requested resource.
- [ ] Never trust a `user_id` supplied by the frontend.
- [ ] Prevent Student A from reading, modifying, or deleting Student B's profile, resume, interview history, scores, or progress.
- [ ] Return safe 403/404 responses when unauthorized resources are requested.

### 4.3 Remove Hard-Coded Dashboard Data
- [ ] Remove hard-coded readiness, resume, interview, job-match, skill, DSA, streak, and achievement values.
- [ ] Calculate dashboard metrics from real stored data and actual student activity.
- [ ] Document the formula used for every derived score.

### 4.4 Deterministic ATS Scoring
- [ ] Do not allow an LLM alone to determine the numerical ATS score.
- [ ] Build a deterministic scoring engine with documented weights.
- [ ] Use AI only for explanations, semantic interpretation, and recommendations where appropriate.
- [ ] Make ATS results reproducible: the same resume and job description should produce the same deterministic score.

### 4.5 API and Input Security
- [ ] Validate all API inputs on the backend.
- [ ] Restrict request body sizes and AI input/output token sizes.
- [ ] Implement authentication-based and IP-based rate limiting.
- [ ] Prevent clients from directly setting scores or other protected fields.
- [ ] Return safe production errors without stack traces, secrets, database paths, or internal implementation details.

### 4.6 Production CORS & Secrets
- [ ] Restrict CORS to the real production frontend and required development origins.
- [ ] Never expose Gemini/API keys, database credentials, authentication secrets, or private tokens in frontend bundles, URLs, localStorage, or logs.

## 5. Resume Processing & ATS

### 5.1 Resume Upload
- [ ] Accept only supported PDF and DOCX formats.
- [ ] Validate extension, MIME type, and actual file structure.
- [ ] Reject empty, corrupt, password-protected, malformed, or excessively large files safely.
- [ ] Set a practical file-size limit, such as 5–10 MB, and a reasonable page limit.
- [ ] Provide clear user-facing errors when a document cannot be processed.

### 5.2 Resume Parsing Pipeline
- [ ] Upload → validate → extract text → clean text → detect sections → extract information → extract skills → calculate ATS → generate recommendations.
- [ ] Support common sections such as Contact, Summary, Education, Skills, Experience, Internships, Projects, Certifications, and Achievements.
- [ ] Handle different layouts, bullets, tables, hyperlinks, multiple pages, missing sections, and unusual formatting.

### 5.3 ATS Scoring Model
- [ ] Implement a transparent weighted model. (Contact 5%, Education 10%, Skills 20%, Projects 15%, Experience/Internship 15%, Certifications 10%, Keywords 15%, Formatting 5%, Section Completeness 5%).
- [ ] Keep the numerical calculation backend-controlled.
- [ ] Show the score breakdown, strengths, weaknesses, missing keywords, missing skills, and recommendations.

## 6. Job Description Matching & Skill Intelligence
- [ ] Extract required skills from the job description.
- [ ] Normalize equivalent names such as React.js / React JS / ReactJS into React.
- [ ] Compare required skills with verified resume skills.
- [ ] Display matched skills and missing skills.
- [ ] Calculate an explainable job-match percentage.
- [ ] Identify experience, technology, and keyword gaps.
- [ ] Generate recommendations from actual gaps rather than a generic roadmap.
- [ ] Maintain a normalized skill taxonomy covering programming, frontend, backend, databases, cloud, AI/ML, DevOps, and relevant placement skills.

## 7. Readiness Index
- [ ] Recalculate readiness from current backend data.
- [ ] Show why the score changed.
- [ ] Do not allow the frontend to submit or overwrite the final readiness score.

## 8. AI Mentor & Prompt Security
- [ ] Build the Mentor context from the student's real profile, resume, skills, missing skills, target role, target companies, job matches, interview history, and learning progress.
- [ ] Treat uploaded resumes, job descriptions, and retrieved documents strictly as data—not as instructions.
- [ ] Protect against prompt injection such as 'ignore previous instructions' embedded inside uploaded or retrieved content.
- [ ] Limit input size, output size, request frequency, retries, and daily/monthly usage.
- [ ] Return useful, specific recommendations tied to measurable student gaps.

## 9. Interview Coach
- [ ] Score interviews using a consistent backend rubric.
- [ ] Display category scores, strengths, weaknesses, actionable improvements, and an improved answer where appropriate.
- [ ] Never allow the frontend to submit a score directly.
- [ ] Store interview attempts and scores against the authenticated student.

## 10. Company RAG / Knowledge Base
- [ ] Separate verified source information from AI-generated interpretation.
- [ ] Prevent the model from inventing hiring dates, salaries, eligibility, interview processes, or company policies.
- [ ] Protect retrieved documents against prompt injection and data poisoning.
- [ ] Limit query length, retrieval size, response size, and request frequency.
- [ ] Show source information where practical.

## 11. Database & Persistence
- [ ] Use proper persistent storage for users, profiles, resumes, resume analyses, skills, user skills, jobs, job matches, interviews, interview answers, roadmaps, learning progress, achievements, and AI usage.
- [ ] Add `user_id`, `created_at`, and `updated_at` where appropriate.
- [ ] Use primary keys, foreign keys, unique constraints, and indexes.
- [ ] Ensure application data survives refresh, logout/login, and new sessions.
- [ ] Do not rely on browser localStorage for authoritative student data.

## 12. API Design & Error Handling
- [ ] Validate all input types, required fields, lengths, enums, numeric ranges, and JSON structures.
- [ ] Use consistent HTTP status codes.
- [ ] Return structured, user-safe error responses (no stack traces).
- [ ] Set request timeouts and safe retry limits for external AI services.

## 13. Frontend & UX
- [ ] Every major workflow must have Loading, Success, Empty, Error, and Retry states.
- [ ] Show progress during operations.
- [ ] Dashboard should emphasize real metrics.
- [ ] Resume analysis should show score breakdown.
- [ ] Job matching should show matched/missing skills.
- [ ] Roadmap should be generated from actual gaps.

## 14-16. UX, Performance, Monitoring
- [ ] Responsive Design & Accessibility checks.
- [ ] Performance optimizations (bundle size, duplicate calls, DB indexes, caching).
- [ ] Observability (log API failures safely, backend health checks).

## 17. Testing Requirements
- [ ] Authentication Tests
- [ ] Authorization Tests
- [ ] Resume Tests
- [ ] ATS Tests
- [ ] API Tests
