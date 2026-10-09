import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

export default function OnboardingModal({ isOpen, onClose }) {
  const { session, updateStudentProfile, startNewAnalysis } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState(session?.identity?.name || 'Shiva');
  const [role, setRole] = useState(session?.identity?.targetRole || 'Software Engineer');
  const [journeyLevel, setJourneyLevel] = useState(session?.identity?.preparationLevel || 'Intermediate');
  const [selectedCompanies, setSelectedCompanies] = useState(session?.identity?.targetCompanies || ['Amazon', 'TCS', 'Infosys', 'Google']);

  if (!isOpen) return null;

  const roles = [
    'Software Engineer',
    'Full Stack Developer',
    'AI/ML Engineer',
    'Data Analyst',
    'ServiceNow Developer'
  ];

  const levels = [
    { id: 'Beginner', title: 'Beginner', desc: 'Starting DSA & fundamental coding' },
    { id: 'Intermediate', title: 'Intermediate', desc: 'Solved 30+ problems, building projects' },
    { id: 'Interview Ready', title: 'Interview Ready', desc: 'Prepping for active campus drives' },
  ];

  const availableCompanies = [
    'Amazon', 'TCS', 'Infosys', 'Accenture', 'Capgemini', 'LTIMindtree', 'Google', 'Microsoft', 'Deloitte', 'Wipro'
  ];

  const toggleCompany = (c) => {
    if (selectedCompanies.includes(c)) {
      setSelectedCompanies(selectedCompanies.filter(x => x !== c));
    } else {
      setSelectedCompanies([...selectedCompanies, c]);
    }
  };

  const handleFinish = () => {
    updateStudentProfile?.({
      identity: {
        name: studentName,
        targetRole: role,
        preparationLevel: journeyLevel,
        targetCompanies: selectedCompanies,
      },
    });
    onClose();
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(7, 8, 14, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1.5px solid var(--indigo)',
          borderRadius: '28px',
          width: '100%',
          maxWidth: '540px',
          padding: '2.5rem',
          boxShadow: '0 25px 70px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Top Stepper Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge badge-indigo">STEP {step} OF 4</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              {step === 1 ? 'Target Role' : step === 2 ? 'Journey Stage' : step === 3 ? 'Target Companies' : 'Sync Profile'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>

        {/* ─── STEP 1: WHAT ROLE ARE YOU TARGETING? ──────────────────── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                What role are you targeting?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                We configure your skill gaps, job matches, and questions for this specific profile.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Student Name:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your Name (e.g. Shiva)"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    background: role === r ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-surface)',
                    border: `1.5px solid ${role === r ? 'var(--indigo)' : 'var(--border-default)'}`,
                    color: 'var(--text-primary)',
                    borderRadius: '14px',
                    padding: '0.85rem 1.2rem',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{r}</span>
                  <span>{role === r ? '●' : '○'}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
              style={{ borderRadius: '14px', padding: '0.85rem' }}
            >
              Next: Journey Stage →
            </button>
          </div>
        )}

        {/* ─── STEP 2: WHERE ARE YOU IN YOUR JOURNEY? ─────────────────── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                Where are you in your journey?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                This tunes your initial DSA target problem count and readiness thresholds.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {levels.map(l => (
                <button
                  key={l.id}
                  onClick={() => setJourneyLevel(l.id)}
                  style={{
                    background: journeyLevel === l.id ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-surface)',
                    border: `1.5px solid ${journeyLevel === l.id ? 'var(--indigo)' : 'var(--border-default)'}`,
                    color: 'var(--text-primary)',
                    borderRadius: '14px',
                    padding: '1rem 1.2rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{l.title}</span>
                    <span style={{ color: journeyLevel === l.id ? 'var(--indigo-light)' : 'var(--text-muted)' }}>
                      {journeyLevel === l.id ? '●' : '○'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.desc}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary"
                style={{ borderRadius: '14px', padding: '0.85rem 1.2rem' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '14px', padding: '0.85rem' }}
              >
                Next: Target Companies →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: WHICH COMPANIES INTEREST YOU? ─────────────────── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                Which companies interest you?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                Select your dream campus recruiters to track in the Company Hub.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {availableCompanies.map(c => {
                const isSelected = selectedCompanies.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCompany(c)}
                    style={{
                      background: isSelected ? 'var(--indigo)' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      border: `1.5px solid ${isSelected ? 'var(--indigo)' : 'var(--border-default)'}`,
                      borderRadius: '12px',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {c}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStep(2)}
                className="btn btn-secondary"
                style={{ borderRadius: '14px', padding: '0.85rem 1.2rem' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '14px', padding: '0.85rem' }}
              >
                Next: Resume Setup →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: UPLOAD RESUME & INITIALIZE ──────────────────────── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                Upload resume & initialize.
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                Then PlaceAI automatically constructs your personal Placement Command Center!
              </p>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '2px dashed var(--indigo)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{ fontSize: '2.5rem' }}>📄</div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', display: 'block' }}>
                  Active Profile: {studentName}'s Resume
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                  Ready to analyze with 84/100 ATS baseline
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setStep(3)}
                className="btn btn-secondary"
                style={{ borderRadius: '14px', padding: '0.85rem 1.2rem' }}
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '14px', padding: '0.85rem', fontWeight: 800 }}
              >
                Launch PlaceAI Command Center 🚀
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
