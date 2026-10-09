import axios from 'axios';

const defaultHost = typeof window !== 'undefined' && window.location.hostname
  ? window.location.hostname
  : 'localhost';

const isProd = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (isProd ? '/api' : `http://${defaultHost}:8000/api`);

const api = axios.create({ baseURL: API_BASE_URL });

// Attach JWT on every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('placeai_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Global error interceptor: never expose internal details in console in production
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;
    // Re-throw a clean error object
    const message =
      status === 401 ? 'Session expired. Please log in again.' :
      status === 403 ? 'You do not have permission to access this resource.' :
      status === 413 ? 'File is too large. Maximum size is 5 MB.' :
      status === 429 ? 'Too many requests. Please wait a moment.' :
      detail || 'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default {
  // ── Auth ─────────────────────────────────────────────────────────
  getMe: () => api.get('/auth/me'),

  // ── Dashboard ────────────────────────────────────────────────────
  getDashboardSummary: () => api.get('/dashboard/summary'),

  // ── Resume ───────────────────────────────────────────────────────
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  scoreResumeAts: (file, job_description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resume/ats-score', formData, {
      params: { job_description },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getResumeAnalysis: () => api.get('/resume/analysis'),
  getResumes: () => api.get('/resume'),
  deleteResume: (id) => api.delete(`/resume/${id}`),

  // ── Job Descriptions ─────────────────────────────────────────────
  analyzeJob: (title, company, raw_text) =>
    api.post('/job/analyze', { title, company, raw_text }),
  getJobs: () => api.get('/job'),
  getJob: (id) => api.get(`/job/${id}`),

  // ── Matching ─────────────────────────────────────────────────────
  runMatch: (resume_id, job_id) =>
    api.post('/matching/match', { resume_id, job_id }),
  getMatches: (job_id) => api.get('/matching', { params: { job_id } }),
  getMatchDetails: (match_id) => api.get(`/matching/${match_id}`),

  // ── Skills ───────────────────────────────────────────────────────
  getSkillGaps: () => api.get('/skills/gaps'),

  // ── Learning Roadmap ─────────────────────────────────────────────
  generateRoadmap: (target_role, skill_gap_source = null, current_skills = [], missing_skills = []) =>
    api.post('/roadmap/generate', { target_role, skill_gap_source, current_skills, missing_skills }),
  updateRoadmapProgress: (completed_tasks) =>
    api.patch('/roadmap/progress', { completed_tasks }),

  // ── Interview Coach ───────────────────────────────────────────────
  startInterview: (topic, difficulty = 'Intermediate', job_id = null, num_questions = 5) =>
    api.post('/interview/start', { topic, difficulty, job_id, num_questions }),
  evaluateInterview: (topic, qna_records) =>
    api.post('/interview/evaluate', { topic, qna_records }),
  getInterviewSummary: () => api.get('/interview/summary'),

  // ── Company Research ─────────────────────────────────────────────
  researchCompany: (company_name) =>
    api.post('/research/company', { company_name }),

  // ── Chat / AI Mentor ─────────────────────────────────────────────
  sendChatMessage: (payload) =>
    api.post('/chat/query', payload),
  getChatHistory: (session_id = 'default') =>
    Promise.resolve({ data: [] }),

  // ── Code Reviewer ────────────────────────────────────────────────
  analyzeCode: (code, filename = 'main.py') =>
    api.post('/code/analyze', { code, filename }),
  refactorDocstrings: (code, style = 'google') =>
    api.post('/code/refactor-docstrings', { code, style }),
  generateTests: (code) => api.post('/code/generate-tests', { code }),
  runTests: (code, test_code = null) =>
    api.post('/code/run-tests', { code, test_code }),
};
