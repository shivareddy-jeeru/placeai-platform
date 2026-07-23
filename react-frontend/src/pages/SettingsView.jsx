import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';

const SettingsView = () => {
  const { profile, setProfile, resetSession, session } = useSession();
  
  // Local state for profile form
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [targetCompany, setTargetCompany] = useState(profile.targetCompany);
  const [preferredRole, setPreferredRole] = useState(profile.preferredRole);
  const [preferredLanguage, setPreferredLanguage] = useState(profile.preferredLanguage);
  const [notifications, setNotifications] = useState(profile.notificationsEnabled);

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({
      name,
      email,
      targetCompany,
      preferredRole,
      preferredLanguage,
      notificationsEnabled: notifications
    });
    alert('Profile preferences updated successfully!');
  };

  return (
    <div className="settings-view">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">⚙️ Profile Settings</h1>
        <p className="page-subtitle">Configure your career goals, target companies, preferred languages, and personal notification preferences.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Profile Preferences Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Personal & Career Preferences</h3>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Target Company</label>
                <select value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} className="form-control">
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Accenture">Accenture</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Preferred Role</label>
                <select value={preferredRole} onChange={(e) => setPreferredRole(e.target.value)} className="form-control">
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Preferred Language</label>
              <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="form-control">
                <option value="JavaScript">JavaScript / TypeScript</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.85rem' }}>Enable AI career recommendation and roadmap notifications</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '1rem' }}>
              💾 Save Profile Preferences
            </button>
          </form>
        </div>

        {/* Right Column: Active Session & Cache Cleanups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>🧹 Session Operations</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Clearing your session releases active file parsers, prompt context variables, and temporary vector search structures immediately.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.75rem' }}
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your current placement prep session?")) {
                    resetSession();
                  }
                }}
                disabled={!session}
              >
                🔄 Reset Active Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
