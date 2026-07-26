import React from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';

export default function TodaysPlan() {
  const { placementProfile, completeTask } = usePlacementProfile();
  const dailyPlan = placementProfile?.dailyPlan || [];

  const completedCount = dailyPlan.filter(t => t.completed).length;
  const progressPct = Math.round((completedCount / (dailyPlan.length || 1)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            DAILY PREPARATION CHECKLIST
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
            Today's Priority Preparation Plan 🎯
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
            Complete your high-impact daily checklist to boost your readiness score and maintain your 6-day streak.
          </p>
        </div>

        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '18px', padding: '0.8rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>PROGRESS TODAY</span>
            <strong style={{ fontSize: '1.2rem', color: '#10b981', display: 'block' }}>{completedCount} of {dailyPlan.length} Done ({progressPct}%)</strong>
          </div>
        </div>
      </div>

      {/* TODAY'S TASKS LIST */}
      <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
          Assigned Daily Preparation Tasks
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {dailyPlan.map(task => (
            <div
              key={task.id}
              style={{
                background: task.completed ? 'rgba(16, 185, 129, 0.08)' : '#0f1117',
                border: `1px solid ${task.completed ? '#10b981' : '#2d3342'}`,
                borderRadius: '18px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <button
                  onClick={() => completeTask(task.id)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: task.completed ? '#10b981' : '#1e2438',
                    border: `1px solid ${task.completed ? '#10b981' : '#475569'}`,
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {task.completed ? '✓' : ''}
                </button>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '0.15rem 0.55rem', borderRadius: '6px', fontWeight: '800' }}>
                      {task.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>⏱ {task.duration} mins</span>
                  </div>
                  <strong style={{ fontSize: '1.05rem', color: task.completed ? '#94a3b8' : '#ffffff', textDecoration: task.completed ? 'line-through' : 'none', display: 'block' }}>
                    {task.title}
                  </strong>
                </div>
              </div>

              <button
                onClick={() => completeTask(task.id)}
                style={{
                  background: task.completed ? 'rgba(16, 185, 129, 0.18)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: task.completed ? '#34d399' : '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.85rem',
                  fontWeight: '900',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {task.completed ? '✓ Completed' : 'Mark Done'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
