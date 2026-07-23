import axios from 'axios';

const defaultHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${defaultHost}:8000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

export default {
  // Session management
  createSession: () => api.post('/session/create'),
  deleteSession: (id) => api.delete(`/session/${id}`),
  getSessionDetails: (id) => api.get(`/session/${id}`),

  // Dashboard
  getDashboardSummary: () => api.get('/dashboard/summary'),

  // Resumes
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getResumeAnalysis: () => api.get('/resume/analysis'),
  getResumes: () => api.get('/resume'),
  deleteResume: (id) => api.delete(`/resume/${id}`),

  // Job Descriptions
  analyzeJob: (title, company, raw_text) => api.post('/job/analyze', { title, company, raw_text }),
  getJobs: () => api.get('/job'),
  getJob: (id) => api.get(`/job/${id}`),

  // Matching
  runMatch: (resume_id, job_id) => api.post('/matching/match', { resume_id, job_id }),
  getMatches: (job_id) => api.get('/matching', { params: { job_id } }),
  getMatchDetails: (match_id) => api.get(`/matching/${match_id}`),

  // Skills
  getSkillGaps: () => api.get('/skills/gaps'),

  // Learning Roadmap
  generateRoadmap: (target_role, skill_gap_source = null, current_skills = [], missing_skills = []) => api.post('/roadmap/generate', {
    target_role,
    skill_gap_source,
    current_skills,
    missing_skills
  }),
  updateRoadmapProgress: (completed_tasks) => api.patch('/roadmap/progress', { completed_tasks }),

  // Mock Interview Coach
  startInterview: (topic, difficulty = 'Intermediate', job_id = null, num_questions = 5) => api.post('/interview/start', {
    topic,
    difficulty,
    job_id,
    num_questions
  }),
  evaluateInterview: (topic, qna_records) => api.post('/interview/evaluate', {
    topic,
    qna_records
  }),
  getInterviewSummary: () => api.get('/interview/summary'),

  // Company Research
  researchCompany: (company_name) => api.post('/research/company', { company_name }),

  // Chat / AI Mentor
  sendChatMessage: (content, session_id = 'default') => api.post('/chat/query', { content, session_id }),
  getChatHistory: (session_id = 'default') => api.get(`/chat/history/${session_id}`),
};
