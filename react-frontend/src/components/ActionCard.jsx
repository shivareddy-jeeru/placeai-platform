import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ActionCard({ action }) {
  const navigate = useNavigate();

  const defaultAction = {
    title: 'Study System Design & Scalability Fundamentals',
    description: 'System Design is your highest-impact skill gap (42%). Review caching, load balancing, and database indexing to prepare for senior rounds.',
    estimatedTime: '25 mins',
    impact: 'Potential impact: +7% readiness',
    route: '/skills',
    priority: 'HIGH'
  };

  const act = action || defaultAction;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '24px',
        padding: '1.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 30px rgba(99, 102, 241, 0.15)'
      }}
    >
      <div style={{ flex: 1, minWidth: '280px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <span style={{ background: '#6366f1', color: '#ffffff', fontSize: '0.65rem', fontWeight: '900', padding: '0.2rem 0.6rem', borderRadius: '999px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            🎯 NEXT BEST ACTION
          </span>
          <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: '700' }}>
            ⏱ {act.estimatedTime} • {act.impact}
          </span>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
          {act.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
          {act.description}
        </p>
      </div>

      <button
        onClick={() => navigate(act.route || '/learning-roadmap')}
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '14px',
          padding: '0.9rem 1.8rem',
          fontSize: '0.92rem',
          fontWeight: '900',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span>Continue Preparation</span>
        <span>→</span>
      </button>
    </div>
  );
}
