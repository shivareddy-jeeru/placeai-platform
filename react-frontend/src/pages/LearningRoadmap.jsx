import React, { useState } from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';
import { EVENTS } from '../utils/eventEmitter';

export default function LearningRoadmap() {
  const { dispatchEvent } = usePlacementProfile();

  const [phases, setPhases] = useState([
    {
      id: 'phase-1',
      title: 'Phase 1: Profile & Resume Baseline',
      status: 'Completed',
      pct: 100,
      tasks: [
        { id: 'p1-1', title: 'Upload initial resume PDF', done: true },
        { id: 'p1-2', title: 'Achieve 80+ ATS compatibility score', done: true }
      ]
    },
    {
      id: 'phase-2',
      title: 'Phase 2: Core DSA & Algorithm Mastery',
      status: 'In Progress',
      pct: 78,
      tasks: [
        { id: 'p2-1', title: 'Solve 20 Array & String problems', done: true },
        { id: 'p2-2', title: 'Solve 15 Tree & Graph problems', done: true },
        { id: 'p2-3', title: 'Master Dynamic Programming patterns', done: false }
      ]
    },
    {
      id: 'phase-3',
      title: 'Phase 3: System Design & Mock Practice',
      status: 'Upcoming',
      pct: 35,
      tasks: [
        { id: 'p3-1', title: 'Study Caching & Load Balancers', done: false },
        { id: 'p3-2', title: 'Complete 3 STAR Behavioral Mock Interviews', done: false }
      ]
    },
    {
      id: 'phase-4',
      title: 'Phase 4: Target Company Final Revision',
      status: 'Upcoming',
      pct: 0,
      tasks: [
        { id: 'p4-1', title: 'Complete Amazon SDE-1 7-Day Mock Plan', done: false },
        { id: 'p4-2', title: 'Final Placement Readiness Audit', done: false }
      ]
    }
  ]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* HEADER */}
      <div>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          4-WEEK PHASE PROGRESSION
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
          Personalized Learning Roadmap 🗺️
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
          Structured 4-phase preparation timeline tailored for your target Software Engineer role.
        </p>
      </div>

      {/* PHASES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {phases.map(p => (
          <div key={p.id} style={{ background: '#161925', border: `1px solid ${p.status === 'In Progress' ? '#6366f1' : '#2d3342'}`, borderRadius: '24px', padding: '1.75rem 2rem' }}>
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
