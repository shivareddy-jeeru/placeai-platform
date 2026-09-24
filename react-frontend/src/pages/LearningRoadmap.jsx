import React, { useState, useEffect } from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';
import { EVENTS } from '../utils/eventEmitter';
import { useNavigate } from 'react-router-dom';

export default function LearningRoadmap() {
  const { placementProfile, dispatchEvent } = usePlacementProfile();
  const navigate = useNavigate();

  const atsResult = placementProfile?.atsResult || null;
  const missingSkills = atsResult?.missingSkills || [];

  const [phases, setPhases] = useState([]);

  useEffect(() => {
    const hasResume = !!atsResult;
    const isAtsReady = atsResult?.resumeAtsScore >= 80;

    const dynamicPhases = [
      {
        id: 'phase-1',
        title: 'Phase 1: Profile & Resume Baseline',
        status: hasResume ? (isAtsReady ? 'Completed' : 'In Progress') : 'Upcoming',
        pct: hasResume ? (isAtsReady ? 100 : 50) : 0,
        tasks: [
          { id: 'p1-1', title: 'Upload initial resume PDF', done: hasResume },
          { id: 'p1-2', title: `Achieve 80+ ATS score (Current: ${hasResume ? atsResult.resumeAtsScore : '--'}/100)`, done: isAtsReady }
        ]
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Core Technical & Skill Gap Mastery',
        status: hasResume ? 'In Progress' : 'Upcoming',
        pct: hasResume ? 66 : 0,
        tasks: [
          { id: 'p2-1', title: `Master ${missingSkills[0] || 'System Design & Distributed Scalability'}`, done: false },
          { id: 'p2-2', title: `Practice ${missingSkills[1] || 'Docker Containerization & Kubernetes'}`, done: false },
          { id: 'p2-3', title: 'Solve 20 LeetCode Medium Array & String problems', done: true }
        ]
      },
      {
        id: 'phase-3',
        title: 'Phase 3: System Design & Mock Interviews',
        status: 'Upcoming',
        pct: hasResume ? 20 : 0,
        tasks: [
          { id: 'p3-1', title: 'Study Distributed Caching (Redis Cache-Aside Pattern)', done: false },
          { id: 'p3-2', title: 'Complete 3 STAR Behavioral Mock Interviews', done: false }
        ]
      },
      {
        id: 'phase-4',
        title: 'Phase 4: Target Company Final Revision',
        status: 'Upcoming',
        pct: 0,
        tasks: [
          { id: 'p4-1', title: 'Complete Amazon SDE-1 / Target Company 7-Day Mock Plan', done: false },
          { id: 'p4-2', title: 'Final Placement Readiness Audit', done: false }
        ]
      }
    ];

    setPhases(dynamicPhases);
  }, [atsResult]);

  const toggleTask = (phaseId, taskId) => {
    setPhases(prev => prev.map(p => {
      if (p.id === phaseId) {
        const updatedTasks = p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
        const completedCount = updatedTasks.filter(t => t.done).length;
        const pct = Math.round((completedCount / updatedTasks.length) * 100);
        return { ...p, tasks: updatedTasks, pct, status: pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Upcoming' };
      }
      return p;
    }));
    dispatchEvent(EVENTS.TASK_COMPLETED, { category: 'DSA' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '140px' }}>
      {/* HEADER */}
      <div>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          4-WEEK PHASE PROGRESSION
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
          Personalized Learning Roadmap 🗺️
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
          Structured preparation timeline tailored dynamically for your target role and extracted ATS skill gaps.
        </p>
      </div>

      {/* UNANALYZED NOTICE */}
      {!atsResult && (
        <div style={{ background: '#161925', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '20px', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.88rem', color: '#a5b4fc', fontWeight: '700' }}>
            💡 Upload your resume to unlock customized learning tasks based on your actual missing skills!
          </span>
          <button
            onClick={() => navigate('/resume')}
            style={{ background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
          >
            ☁️ Upload Resume →
          </button>
        </div>
      )}

      {/* PHASES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {phases.map(p => (
          <div key={p.id} style={{ background: '#161925', border: `1px solid ${p.status === 'Completed' ? 'rgba(16, 185, 129, 0.4)' : p.status === 'In Progress' ? '#6366f1' : '#2d3342'}`, borderRadius: '24px', padding: '1.75rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '900', color: p.status === 'Completed' ? '#34d399' : p.status === 'In Progress' ? '#818cf8' : '#94a3b8' }}>
                  {p.status} • {p.pct}% COMPLETE
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
                  {p.title}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {p.tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(p.id, t.id)}
                  style={{
                    background: '#0f1117',
                    border: '1px solid #2d3342',
                    borderRadius: '14px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: t.done ? '#94a3b8' : '#ffffff', textDecoration: t.done ? 'line-through' : 'none', fontWeight: '600' }}>
                    {t.done ? '✓' : '○'} {t.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: t.done ? '#34d399' : '#818cf8', fontWeight: '800' }}>
                    {t.done ? 'Done' : 'Mark Complete'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
