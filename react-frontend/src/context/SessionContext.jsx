import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SessionContext = createContext();

/**
 * SessionProvider — manages live data fetched from the backend.
 * No hardcoded scores, streaks, or metrics. All data is backend-derived.
 */
export const SessionProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);  // from /dashboard/summary
  const [loading, setLoading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);   // last ATS result in this browser session
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const refreshDashboard = async () => {
    try {
      const res = await api.getDashboardSummary();
      setDashboardData(res.data);
    } catch (err) {
      // 401 will be caught at the global level; other errors — swallow silently here
      if (!err.message?.includes('log in')) {
        console.error('Failed to refresh dashboard:', err.message);
      }
    }
  };

  // Thin wrapper so pages can trigger an ATS upload and refresh dashboard afterwards
  const startNewAnalysis = async (file, jdText = '') => {
    setLoading(true);
    showToast('Scoring resume with deterministic ATS engine…', 'info');
    try {
      const res = await api.scoreResumeAts(file, jdText);
      const data = { ...res.data, fileName: file?.name || 'Resume.pdf' };
      setAtsResult(data);
      await refreshDashboard();
      showToast(`ATS Score: ${data.resumeAtsScore}/100 ✅`, 'success');
      return data;
    } catch (err) {
      showToast(err.message || 'Resume analysis failed. Please try again.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Expose a placementProfile-shaped object that pages depend on (read-only, computed)
  const placementProfile = dashboardData
    ? {
        identity: { name: '', targetRole: '', targetCompanies: [], preparationLevel: '' },
        scores: {
          readiness: dashboardData.readiness_score,
          resume: dashboardData.latest_ats_score || null,
          interview: null,
          jobMatch: dashboardData.latest_match_percentage || null,
          skills: dashboardData.skills_extracted?.length || 0,
        },
        progress: {
          resumesAnalyzed: dashboardData.total_resumes,
          dsaProblemsSolved: 0,
          interviewsCompleted: 0,
          tasksCompleted: 0,
        },
        nextAction: {
          title: dashboardData.priority_action_title,
          reason: dashboardData.priority_action_reason,
          module: dashboardData.priority_action_module,
        },
        atsResult,
      }
    : null;

  return (
    <SessionContext.Provider value={{
      session: placementProfile,
      placementProfile,
      dashboardData,
      loading,
      atsResult,
      startNewAnalysis,
      refreshDashboard,
      showToast,
    }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error'
              ? 'linear-gradient(135deg, #450a0a, #0f1117)'
              : t.type === 'info'
                ? 'linear-gradient(135deg, #1e293b, #0f172a)'
                : 'linear-gradient(135deg, #052e16, #0f1117)',
            border: `1px solid ${t.type === 'error' ? '#ef4444' : t.type === 'info' ? '#3b82f6' : '#10b981'}`,
            color: '#ffffff', padding: '0.9rem 1.4rem', borderRadius: '16px',
            fontSize: '0.9rem', fontWeight: '700',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            maxWidth: '380px'
          }}>
            <span>{t.type === 'error' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '✅'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

// Backward-compat export — pages that imported DEFAULT_DEMO_SESSION get null now
export const DEFAULT_DEMO_SESSION = null;
