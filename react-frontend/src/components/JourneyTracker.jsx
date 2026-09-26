import React from 'react';

export default function JourneyTracker({ journey = {} }) {
  const steps = [
    { label: 'Analyze', icon: '📄', val: journey.resume || 84, active: true },
    { label: 'Discover Gaps', icon: '⚡', val: journey.skills || 68, active: true },
    { label: 'Get Roadmap', icon: '🗺️', val: journey.preparation || 54, active: true },
    { label: 'Practice & Mock', icon: '🎤', val: journey.interviews || 42, active: false }
  ];

  return (
    <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '1.75rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            PREPARATION LOOP
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
            Placement Readiness Journey
          </h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.15)', padding: '0.3rem 0.75rem', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          Step 3 Active
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', position: 'relative' }}>
        {steps.map((s, idx) => (
          <div
            key={s.label}
            style={{
              background: '#0f1117',
              border: `1px solid ${s.active ? '#6366f1' : '#2d3342'}`,
              borderRadius: '16px',
              padding: '1.1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              position: 'relative'
            }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: s.active ? 'rgba(99, 102, 241, 0.2)' : '#1e2438', border: `1px solid ${s.active ? '#6366f1' : '#475569'}`, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
              {s.icon}
            </div>
            <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{s.label}</strong>
            <span style={{ fontSize: '0.75rem', color: s.active ? '#818cf8' : '#64748b', fontWeight: '800' }}>
              {s.val}% Complete
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
