import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MentorBar() {
  const navigate = useNavigate();

  const handleAskMentor = (promptText) => {
    navigate('/assistant', { state: { initialPrompt: promptText } });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '270px',
        right: 0,
        background: 'linear-gradient(135deg, #161925 0%, #0f1117 100%)',
        borderTop: '1px solid #2d3342',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 800,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.4)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '1rem', fontWeight: '900' }}>
          ✨
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI CAREER COPILOT
          </span>
          <strong style={{ fontSize: '0.88rem', color: '#ffffff', display: 'block' }}>
            Senior Placement Mentor is active. Ask for real-time interview prep or resume optimization.
          </strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.6rem' }}>
        {[
          'Explain System Design',
          'Optimize Resume ATS',
          'Behavioral Interview Tips'
        ].map(p => (
          <button
            key={p}
            onClick={() => handleAskMentor(p)}
            style={{
              background: '#0f1117',
              border: '1px solid #2d3342',
              color: '#cbd5e1',
              borderRadius: '999px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {p} →
          </button>
        ))}
        <button
          onClick={() => navigate('/assistant')}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '999px',
            padding: '0.4rem 1rem',
            fontSize: '0.78rem',
            fontWeight: '900',
            cursor: 'pointer'
          }}
        >
          Open Chat ✨
        </button>
      </div>
    </div>
  );
}
