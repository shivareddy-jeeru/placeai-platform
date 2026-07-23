import React, { useState, useEffect } from 'react';
import { useSession, DEFAULT_DEMO_SESSION } from '../context/SessionContext';
import api from '../utils/api';

const RoadmapView = () => {
  const { session, setSession, showToast } = useSession();
  const activeSession = session || DEFAULT_DEMO_SESSION;
  const [completedWeeks, setCompletedWeeks] = useState([1]);

  // Sync completed tasks when roadmap loads
  useEffect(() => {
    if (activeSession?.learningRoadmap) {
      const completed = (activeSession.learningRoadmap.completed_tasks || [])
        .map(Number)
        .filter(n => !isNaN(n));
      if (completed.length > 0) setCompletedWeeks(completed);
    }
  }, [activeSession]);

  // Handle roadmap data format in session state
  const rawWeeks = 
    activeSession?.learningRoadmap?.weeks || 
    activeSession?.learningRoadmap?.roadmap_data?.weeks || 
    activeSession?.learningRoadmap?.roadmap_data?.milestones || 
    activeSession?.learningRoadmap?.milestones || 
    activeSession?.learningRoadmap?.roadmap_data?.phases || 
    activeSession?.learningRoadmap?.phases || 
    [];
  
  // Normalize each item to match the UI expectations:
  const roadmapWeeks = rawWeeks.map((item, index) => {
    let weekNum = index + 1;
    if (typeof item.week === 'number') {
      weekNum = item.week;
    } else if (typeof item.week === 'string') {
      const match = item.week.match(/\d+/);
      if (match) {
        weekNum = parseInt(match[0], 10);
      }
    } else if (item.phase_name) {
      const match = item.phase_name.match(/\d+/);
      if (match) {
        weekNum = parseInt(match[0], 10);
      }
    }
    
    return {
      week: weekNum,
      title: item.title || item.topic || item.phase_name || `Stage ${index + 1}`,
      skills: item.skills || item.tasks || item.skills_addressed || []
    };
  });

  const handleToggleWeek = async (week) => {
    let newCompleted;
    if (completedWeeks.includes(week)) {
      newCompleted = completedWeeks.filter(w => w !== week);
    } else {
      newCompleted = [...completedWeeks, week];
    }
    setCompletedWeeks(newCompleted);

    try {
      const completedStringList = newCompleted.map(String);
      await api.updateRoadmapProgress(completedStringList);
      
      setSession(prev => ({
        ...prev,
        learningRoadmap: {
          ...prev.learningRoadmap,
          completed_tasks: completedStringList
        }
      }));
      showToast(`Updated progress for Week ${week}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save progress to backend.', 'error');
    }
  };

  const progressPercent = roadmapWeeks.length > 0 
    ? Math.round((completedWeeks.length / roadmapWeeks.length) * 100) 
    : 0;

  return (
    <div className="roadmap-view fade-in-up">
      <header className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">🗺️ Learning Roadmap</h1>
          <p className="page-subtitle">Your personalized week-by-week technical curriculum engineered by PlaceAI mentor.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <strong style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Roadmap Progress:</strong>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{progressPercent}%</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Left Column: Weekly Roadmap List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {roadmapWeeks.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Curriculum parsing in progress...
            </div>
          ) : (
            roadmapWeeks.map((item) => {
              const isCompleted = completedWeeks.includes(item.week);
              const isInProgress = !isCompleted && (completedWeeks.length === 0 ? item.week === 1 : item.week === Math.max(...completedWeeks) + 1);
              const isLocked = !isCompleted && !isInProgress;

              return (
                <div 
                  key={item.week}
                  className="card"
                  style={{ 
                    borderLeft: `4px solid ${isCompleted ? 'var(--success)' : isInProgress ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    opacity: isLocked ? 0.65 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      WEEK {item.week}
                    </span>
                    
                    {/* Status Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isCompleted ? (
                        <span className="badge-tag success" style={{ margin: 0 }}>✔ Completed</span>
                      ) : isInProgress ? (
                        <span className="badge-tag info" style={{ margin: 0 }}>▶ In Progress</span>
                      ) : (
                        <span className="badge-tag" style={{ margin: 0, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>🔒 Locked</span>
                      )}

                      <input 
                        type="checkbox" 
                        checked={isCompleted}
                        disabled={isLocked}
                        onChange={() => handleToggleWeek(item.week)}
                        style={{ width: '16px', height: '16px', cursor: isLocked ? 'not-allowed' : 'pointer' }}
                      />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: isLocked ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                  
                  {item.skills && item.skills.length > 0 && (
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Target Competencies:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {item.skills.map((s, idx) => (
                          <span key={idx} style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            border: '1px solid var(--border-color)'
                          }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Daily goals or resources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>📅 Roadmap Overview</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              This roadmap has been generated dynamically by analyzing the gap between your resume and target industry standard expectations. Complete each week's assignments to bridge your skill gaps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapView;
