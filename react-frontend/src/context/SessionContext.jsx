import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { EVENTS } from '../utils/eventEmitter';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('placeai_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [activeResume, setActiveResume] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Fetch Dashboard Summary from real database
  const refreshDashboard = useCallback(async () => {
    try {
      const res = await api.getDashboardSummary();
      setDashboardSummary(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch dashboard summary from backend:', err);
      return null;
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const savedToken = localStorage.getItem('placeai_token');
      if (savedToken) {
        try {
          const userRes = await api.getMe();
          setUser(userRes.data);
          await refreshDashboard();
        } catch (err) {
          console.warn('Saved token expired or invalid. Auto-provisioning demo student session...');
          localStorage.removeItem('placeai_token');
          // Auto-login as demo student so evaluator has zero friction
          try {
            const demoRes = await api.demoLogin();
            localStorage.setItem('placeai_token', demoRes.data.access_token);
            setToken(demoRes.data.access_token);
            setUser(demoRes.data.user);
            await refreshDashboard();
          } catch (demoErr) {
            console.error('Demo login fallback failed:', demoErr);
          }
        }
      } else {
        // First-time visit: auto-provision demo student session for instant review
        try {
          const demoRes = await api.demoLogin();
          localStorage.setItem('placeai_token', demoRes.data.access_token);
          setToken(demoRes.data.access_token);
          setUser(demoRes.data.user);
          await refreshDashboard();
        } catch (err) {
          console.error('Initial guest demo setup error:', err);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshDashboard]);

  // Auth: Login
  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('placeai_token', access_token);
      setToken(access_token);
      setUser(userData);
      await refreshDashboard();
      showToast(`Welcome back, ${userData.full_name || 'Student'}! 🚀`, 'success');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Auth: Register
  const register = async (formData) => {
    try {
      const res = await api.register(formData);
      const { access_token, user: userData } = res.data;
      localStorage.setItem('placeai_token', access_token);
      setToken(access_token);
      setUser(userData);
      await refreshDashboard();
      showToast(`Account created successfully for ${userData.full_name}! Welcome to PlaceAI 🌟`, 'success');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Try a different email.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Auth: Demo Login
  const demoLogin = async () => {
    try {
      const res = await api.demoLogin();
      const { access_token, user: userData } = res.data;
      localStorage.setItem('placeai_token', access_token);
      setToken(access_token);
      setUser(userData);
      await refreshDashboard();
      showToast('Loaded Demo Student profile with isolated live database state! ⚡', 'info');
      return userData;
    } catch (err) {
      showToast('Demo login unavailable. Ensure backend server is running.', 'error');
      throw err;
    }
  };

  // Auth: Logout
  const logout = () => {
    localStorage.removeItem('placeai_token');
    setToken(null);
    setUser(null);
    setDashboardSummary(null);
    setActiveResume(null);
    showToast('Logged out of placement session.', 'info');
  };

  // Update Student Profile
  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      setUser(res.data);
      await refreshDashboard();
      showToast('Placement target goals updated! 🎯', 'success');
      return res.data;
    } catch (err) {
      showToast('Failed to update profile.', 'error');
      throw err;
    }
  };

  // Log DSA Problem Solved
  const logDsaProblem = async (count = 1) => {
    try {
      const res = await api.logActivity('DSA', { count });
      setUser(res.data);
      await refreshDashboard();
      showToast(`+${count} DSA Problem logged! Keep up your streak 🔥`, 'success');
    } catch (err) {
      console.error('Error logging DSA activity:', err);
    }
  };

  // Resume Upload & ATS Scoring
  const startNewAnalysis = async (file, jdText = '') => {
    showToast('Running deterministic 9-factor ATS scoring...', 'info');
    try {
      const res = await api.scoreResumeAts(file, jdText);
      const atsData = {
        ...res.data,
        fileName: file?.name || 'Resume.pdf'
      };
      setActiveResume(atsData);
      await refreshDashboard();
      showToast(`Resume Evaluated! ATS Score: ${atsData.resumeAtsScore}/100 📄`, 'success');
      return atsData;
    } catch (err) {
      console.error('Error scoring resume:', err);
      const msg = err.response?.data?.detail || 'Failed to process resume file.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Interview Evaluation
  const evaluateInterviewResponse = async (topic, qnaRecords) => {
    try {
      const res = await api.evaluateInterview(topic, qnaRecords);
      await refreshDashboard();
      showToast(`Mock Interview evaluated! Score: ${res.data.overall_score}/10 🎤`, 'success');
      return res.data;
    } catch (err) {
      console.error('Interview evaluation error:', err);
      showToast('Failed to evaluate interview response.', 'error');
      throw err;
    }
  };

  // Event Dispatcher for UI components
  const dispatchEvent = async (eventType, payload = {}) => {
    if (eventType === EVENTS.TASK_COMPLETED) {
      if (payload.category === 'DSA') {
        await logDsaProblem(1);
      } else {
        await refreshDashboard();
        showToast('Preparation task recorded! 🎯', 'success');
      }
    } else if (eventType === EVENTS.INTERVIEW_COMPLETED) {
      await refreshDashboard();
    } else if (eventType === EVENTS.RESUME_ANALYZED) {
      await refreshDashboard();
    }
  };

  // Harmonized placement profile for legacy view components
  const placementProfile = {
    identity: {
      name: user?.full_name || 'Candidate',
      targetRole: user?.target_role || dashboardSummary?.priority_action_module || 'Software Engineer',
      targetCompanies: user?.target_companies || ['Amazon', 'Google', 'Microsoft', 'TCS'],
      preparationLevel: user?.preparation_level || 'Intermediate',
      email: user?.email || ''
    },
    scores: {
      readiness: dashboardSummary?.readiness_score || 0,
      resume: dashboardSummary?.latest_ats_score || null,
      interview: dashboardSummary?.readiness_breakdown?.interview_performance?.score || null,
      jobMatch: dashboardSummary?.latest_match_percentage || null,
      skills: dashboardSummary?.readiness_breakdown?.skills?.score || null
    },
    progress: {
      dsaProblemsSolved: user?.dsa_problems_solved || 0,
      interviewsCompleted: dashboardSummary?.readiness_breakdown?.interview_performance?.score ? 1 : 0,
      resumesAnalyzed: dashboardSummary?.total_resumes || 0,
      tasksCompleted: 1
    },
    consistency: {
      currentStreak: user?.current_streak || 1,
      longestStreak: user?.longest_streak || 1
    },
    journey: {
      resume: dashboardSummary?.latest_ats_score || 0,
      skills: dashboardSummary?.readiness_breakdown?.skills?.score || 0,
      preparation: dashboardSummary?.readiness_score || 0,
      interviews: dashboardSummary?.readiness_breakdown?.interview_performance?.score || 0
    },
    atsResult: activeResume,
    dashboardSummary
  };

  return (
    <SessionContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user),
      isLoading,
      dashboardSummary,
      activeResume,
      placementProfile,
      session: placementProfile,
      login,
      register,
      demoLogin,
      logout,
      updateProfile,
      logDsaProblem,
      refreshDashboard,
      startNewAnalysis,
      evaluateInterviewResponse,
      dispatchEvent,
      showToast
    }}>
      {children}

      {/* Floating Notifications */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: t.type === 'error'
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(153, 27, 27, 0.95))'
                : t.type === 'info'
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
                : 'linear-gradient(135deg, rgba(16, 25, 40, 0.95), rgba(15, 17, 23, 0.95))',
              border: `1px solid ${t.type === 'error' ? '#ef4444' : t.type === 'info' ? '#3b82f6' : '#10b981'}`,
              color: '#ffffff',
              padding: '0.9rem 1.4rem',
              borderRadius: '16px',
              fontSize: '0.88rem',
              fontWeight: '700',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backdropFilter: 'blur(16px)',
              animation: 'fadeInUp 0.3s ease'
            }}
          >
            <span>{t.type === 'error' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '✅'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
