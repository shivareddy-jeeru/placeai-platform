import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          setLoading(false);
          return;
        }
        await register(email, password, fullName);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.12), transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1), transparent 50%), #0b0d14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: '900', margin: '0 auto 0.75rem',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}>P</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>PlaceAI</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(22, 25, 37, 0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#0b0d14', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '0.55rem', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '700', fontSize: '0.875rem', transition: 'all 0.2s',
                  background: mode === m ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                  color: mode === m ? '#ffffff' : '#64748b'
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Shiva Reddy"
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@college.edu"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : '••••••••'}
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem',
                color: '#f87171', fontSize: '0.85rem', fontWeight: '600'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.85rem', border: 'none', borderRadius: '12px',
                background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff', fontWeight: '800', fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 15px rgba(99, 102, 241, 0.4)'
              }}
            >
              {loading ? '⏳ Please wait...' : mode === 'login' ? '→ Sign In' : '→ Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          Your data is securely stored and never shared.
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', background: '#0f1117',
  border: '1px solid #2d3342', borderRadius: '10px', color: '#f8f9fa',
  fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};
const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8',
  marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em'
};
