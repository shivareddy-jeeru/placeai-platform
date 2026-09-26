import React, { useState } from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';
import { EVENTS } from '../utils/eventEmitter';
import { useNavigate } from 'react-router-dom';

export default function OnboardingModal({ isOpen, onClose }) {
  const { placementProfile, dispatchEvent } = usePlacementProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(placementProfile?.identity?.targetRole || 'Software Engineer');
  const [company, setCompany] = useState(placementProfile?.identity?.targetCompanies?.[0] || 'Amazon');
  const [level, setLevel] = useState(placementProfile?.identity?.preparationLevel || 'Intermediate');

  if (!isOpen) return null;

  const handleFinish = () => {
    dispatchEvent(EVENTS.ONBOARDING_COMPLETED, {
      identity: {
        targetRole: role,
        targetCompanies: [company, 'TCS'],
        preparationLevel: level
      }
    });
    onClose();
    navigate('/todays-plan');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(11, 13, 20, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          background: '#161925',
          border: '1px solid #6366f1',
          borderRadius: '28px',
          width: '100%',
          maxWidth: '520px',
          padding: '2.25rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            PERSONALIZED PLACEMENT GOAL • STEP {step} OF 3
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>
            ✕
          </button>
        </div>

        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
              Select Your Target Role 🎯
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 1.25rem 0' }}>
              We tune your skill gap thresholds and roadmap based on industry benchmarks.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'ML Engineer', 'DevOps Engineer'].map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    background: role === r ? 'rgba(99, 102, 241, 0.2)' : '#0f1117',
                    border: `1px solid ${role === r ? '#6366f1' : '#2d3342'}`,
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '0.85rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
              Select Primary Target Company 🏢
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 1.25rem 0' }}>
              Generates company-specific PYQ coding questions and interview rubrics.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Amazon', 'TCS Digital', 'Accenture', 'Microsoft', 'Google'].map(c => (
                <button
                  key={c}
                  onClick={() => setCompany(c)}
                  style={{
                    background: company === c ? 'rgba(99, 102, 241, 0.2)' : '#0f1117',
                    border: `1px solid ${company === c ? '#6366f1' : '#2d3342'}`,
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '0.85rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
              Current Preparation Baseline 📈
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 1.25rem 0' }}>
              Helps calibrate daily task durations and preparation intensity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Beginner (Starting fresh)', 'Intermediate (Know basics & DSA)', 'Advanced (Actively interviewing)'].map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  style={{
                    background: level === l ? 'rgba(99, 102, 241, 0.2)' : '#0f1117',
                    border: `1px solid ${level === l ? '#6366f1' : '#2d3342'}`,
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '0.85rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} style={{ background: '#1e2438', border: '1px solid #2d3342', color: '#ffffff', borderRadius: '12px', padding: '0.7rem 1.4rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}>
              ← Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.7rem 1.6rem', fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer' }}>
              Next Step →
            </button>
          ) : (
            <button onClick={handleFinish} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.7rem 1.8rem', fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer' }}>
              Generate Placement Plan 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
