import React, { useState } from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';

export default function SettingsView() {
  const { placementProfile, updateProfile, resetSession, showToast } = usePlacementProfile();
  
  const identity = placementProfile?.identity || {};

  const [name, setName] = useState(identity.name || 'Shiva');
  const [email, setEmail] = useState(identity.email || 'shiva.reddy@example.com');
  const [targetCompany, setTargetCompany] = useState(identity.targetCompanies?.[0] || 'Amazon');
  const [preferredRole, setPreferredRole] = useState(identity.targetRole || 'Software Engineer');
  const [preferredLanguage, setPreferredLanguage] = useState(identity.preferredLanguage || 'JavaScript');
  const [notifications, setNotifications] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    if (updateProfile) {
      updateProfile(prev => ({
        ...prev,
        identity: {
          ...(prev?.identity || {}),
          name,
          email,
          targetRole: preferredRole,
          targetCompanies: [targetCompany, 'TCS'],
          preferredLanguage
        }
      }));
    }
    if (showToast) showToast('Profile preferences updated successfully! 💾');
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all session metrics and restore default profile?")) {
      resetSession();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* HEADER */}
      <header>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          USER PROFILE & PREFERENCES
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
          Profile Settings ⚙️
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
          Configure your career goals, target companies, preferred languages, and personal notification preferences.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Profile Preferences Form */}
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', marginBottom: '1.25rem' }}>
            Personal & Placement Preferences
          </h3>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.75rem 1rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.75rem 1rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>Target Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.75rem 1rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="Amazon">Amazon</option>
                  <option value="TCS">TCS Digital</option>
                  <option value="Accenture">Accenture</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Google">Google</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>Target Role</label>
                <select
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.75rem 1rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="ML Engineer">ML Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>Preferred Technical Stack</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.75rem 1rem', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="JavaScript">JavaScript / React 18</option>
                <option value="Python">Python / FastAPI</option>
                <option value="Java">Java / Spring Boot</option>
                <option value="C++">C++ / Data Structures</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '600' }}>
                Enable AI career recommendation and roadmap notifications
              </span>
            </div>

            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0.85rem 1.5rem', fontSize: '0.92rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)', marginTop: '0.5rem' }}
            >
              💾 Save Profile Preferences
            </button>
          </form>
        </div>

        {/* Right Column: Session & Reset Operations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', marginBottom: '0.8rem' }}>
              🧹 Session & Cache Reset
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              Clearing your session restores initial placement profile metrics, resets daily checklists, and clears cached prompt context variables.
            </p>

            <button
              onClick={handleReset}
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#ef4444',
                borderRadius: '14px',
                padding: '0.85rem 1.2rem',
                fontSize: '0.9rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              🔄 Reset Placement Activity Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
