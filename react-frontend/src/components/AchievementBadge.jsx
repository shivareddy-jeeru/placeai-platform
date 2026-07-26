import React from 'react';

export default function AchievementBadge({ achievement }) {
  const { title, description, icon, unlocked, unlockedAt } = achievement;

  return (
    <div
      style={{
        background: unlocked ? 'linear-gradient(135deg, #161925, #0f1117)' : '#0f1117',
        border: `1px solid ${unlocked ? '#6366f1' : '#2d3342'}`,
        borderRadius: '20px',
        padding: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.2rem',
        opacity: unlocked ? 1 : 0.45,
        boxShadow: unlocked ? '0 8px 24px rgba(99, 102, 241, 0.15)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          background: unlocked ? 'rgba(99, 102, 241, 0.2)' : '#1e2438',
          border: `1px solid ${unlocked ? '#6366f1' : '#475569'}`,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          flexShrink: 0
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
            {title}
          </h4>
          {unlocked && (
            <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: '800' }}>
              UNLOCKED
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
          {description}
        </p>
        {unlockedAt && (
          <span style={{ fontSize: '0.7rem', color: '#818cf8', display: 'block', marginTop: '0.3rem', fontWeight: '700' }}>
            Unlocked: {unlockedAt}
          </span>
        )}
      </div>
    </div>
  );
}
