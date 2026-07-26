import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateReadiness } from '../utils/readinessCalculator';
import { calculateNextBestAction } from '../utils/nextBestAction';
import { checkAchievements } from '../utils/achievementEngine';
import { EVENTS } from '../utils/eventEmitter';

const SessionContext = createContext();

export const initialPlacementProfile = {
  identity: {
    name: 'Shiva',
    targetRole: 'Software Engineer',
    targetCompanies: ['Amazon', 'TCS'],
    preparationLevel: 'Intermediate'
  },
  scores: {
    readiness: 72,
    resume: 84,
    interview: 71,
    jobMatch: 82,
    skills: 68
  },
  progress: {
    dsaProblemsSolved: 47,
    interviewsCompleted: 0,
    resumesAnalyzed: 1,
    tasksCompleted: 1
  },
  consistency: {
    currentStreak: 6,
    longestStreak: 6,
    lastActiveDate: null
  },
  journey: {
    resume: 84,
    skills: 68,
    preparation: 54,
    interviews: 42
  },
  onboarding: {
    completed: true,
    currentStep: 3
  },
  achievements: [],
  dailyPlan: [
    { id: 'dsa-arrays', title: 'Solve 2 Medium Array & Tree Problems', category: 'DSA', duration: 25, completed: false },
    { id: 'resume-impact', title: 'Improve Resume Impact Statements', category: 'Resume', duration: 10, completed: true },
    { id: 'interview-prep', title: 'Practice 5 Behavioral Interview Questions', category: 'Interview', duration: 20, completed: false }
  ],
  nextAction: null
};

export const DEFAULT_DEMO_SESSION = initialPlacementProfile;

export const SessionProvider = ({ children }) => {
  const [placementProfile, setPlacementProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('placeai_placement_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialPlacementProfile,
          ...parsed,
          scores: { ...initialPlacementProfile.scores, ...(parsed.scores || {}) },
          progress: { ...initialPlacementProfile.progress, ...(parsed.progress || {}) },
          journey: { ...initialPlacementProfile.journey, ...(parsed.journey || {}) }
        };
      }
    } catch (e) {
      console.error("Failed loading placement profile from localStorage", e);
    }
    return initialPlacementProfile;
  });

  const [toasts, setToasts] = useState([]);

  // Recalculate next action & achievements whenever profile updates
  useEffect(() => {
    const nextAct = calculateNextBestAction(placementProfile);
    const achs = checkAchievements(placementProfile);
    setPlacementProfile(prev => ({
      ...prev,
      nextAction: nextAct,
      achievements: achs
    }));
    try {
      localStorage.setItem('placeai_placement_profile', JSON.stringify(placementProfile));
    } catch (e) {
      console.error(e);
    }
  }, [placementProfile.scores?.readiness, placementProfile.progress?.dsaProblemsSolved, placementProfile.progress?.interviewsCompleted]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dispatchEvent = (eventType, payload = {}) => {
    setPlacementProfile(prev => {
      let updatedScores = { ...prev.scores };
      let updatedProgress = { ...prev.progress };
      let updatedJourney = { ...prev.journey };

      if (eventType === EVENTS.RESUME_ANALYZED) {
        updatedScores.resume = Math.min(100, (updatedScores.resume || 84) + 6);
        updatedProgress.resumesAnalyzed = (updatedProgress.resumesAnalyzed || 1) + 1;
        updatedJourney.resume = updatedScores.resume;
        showToast('Resume analyzed! ATS score increased to ' + updatedScores.resume + '/100 🎉');
      } else if (eventType === EVENTS.TASK_COMPLETED) {
        updatedProgress.tasksCompleted = (updatedProgress.tasksCompleted || 0) + 1;
        if (payload.category === 'DSA') {
          updatedProgress.dsaProblemsSolved = (updatedProgress.dsaProblemsSolved || 47) + 2;
          showToast('2 DSA problems solved! Total solved: ' + updatedProgress.dsaProblemsSolved + ' 🧠');
        } else {
          showToast('Preparation task completed! +3% readiness 🎯');
        }
      } else if (eventType === EVENTS.INTERVIEW_COMPLETED) {
        updatedScores.interview = Math.min(100, Math.max((updatedScores.interview || 71), payload.score || 78));
        updatedProgress.interviewsCompleted = (updatedProgress.interviewsCompleted || 0) + 1;
        updatedJourney.interviews = updatedScores.interview;
        showToast('Mock Interview completed! Interview score: ' + updatedScores.interview + '% 🎤');
      } else if (eventType === EVENTS.ONBOARDING_COMPLETED) {
        showToast('Placement goal updated for ' + (payload.targetRole || 'Software Engineer') + ' 🚀');
      }

      const newReadiness = calculateReadiness(updatedScores, prev.consistency);
      updatedScores.readiness = newReadiness;

      return {
        ...prev,
        identity: { ...prev.identity, ...(payload.identity || {}) },
        scores: updatedScores,
        progress: updatedProgress,
        journey: updatedJourney
      };
    });
  };

  const completeTask = (taskId) => {
    setPlacementProfile(prev => {
      const updatedPlan = prev.dailyPlan.map(t => {
        if (t.id === taskId) {
          return { ...t, completed: !t.completed };
        }
        return t;
      });
      const completedTask = updatedPlan.find(t => t.id === taskId);
      if (completedTask && completedTask.completed) {
        dispatchEvent(EVENTS.TASK_COMPLETED, { category: completedTask.category });
      }
      return {
        ...prev,
        dailyPlan: updatedPlan
      };
    });
  };

  const startNewAnalysis = async (file, jdText) => {
    showToast('Analyzing resume file: ' + file.name + '...', 'info');
    return new Promise(resolve => {
      setTimeout(() => {
        dispatchEvent(EVENTS.RESUME_ANALYZED, { fileName: file.name });
        resolve({ status: 'success', score: placementProfile.scores.resume + 6 });
      }, 1200);
    });
  };

  const resetSession = () => {
    localStorage.removeItem('placeai_placement_profile');
    setPlacementProfile(initialPlacementProfile);
    showToast('Placement session restored to default profile 🔄', 'info');
  };

  return (
    <SessionContext.Provider value={{
      session: placementProfile,
      placementProfile,
      updateProfile: setPlacementProfile,
      dispatchEvent,
      completeTask,
      startNewAnalysis,
      resetSession,
      showToast
    }}>
      {children}

      {/* TOAST CONTAINER */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: t.type === 'info' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #161925, #0f1117)',
              border: `1px solid ${t.type === 'info' ? '#3b82f6' : '#10b981'}`,
              color: '#ffffff',
              padding: '0.9rem 1.4rem',
              borderRadius: '16px',
              fontSize: '0.9rem',
              fontWeight: '800',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              animation: 'fadeInUp 0.3s ease'
            }}
          >
            <span>{t.type === 'info' ? 'ℹ️' : '✅'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
