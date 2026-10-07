import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, demoLogin } = useSession();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [targetTier, setTargetTier] = useState('Tier 1');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          target_role: targetRole,
          target_company_tier: targetTier
        });
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      onClose();
    } catch (err) {
      setError('Could not initialize demo student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(9, 11, 16, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#111625',
        border: '1px solid #28334e',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
        position: 'relative',
        color: '#ffffff',
        animation: 'fadeInUp 0.25s ease'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '1.4rem',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >
          ✕
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: '900',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 18px rgba(99, 102, 241, 0.4)'
          }}>
            P
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
            {isRegister ? 'Create Student Account' : 'Welcome to PlaceAI'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
            {isRegister
              ? 'Join thousands of students preparing for top placement drives'
              : 'Sign in to access your authentic placement roadmap & readiness'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.84rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Chen"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: '#0a0d14',
                  border: '1px solid #28334e',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
              COLLEGE / STUDENT EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: '#0a0d14',
                border: '1px solid #28334e',
                color: '#ffffff',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: '#0a0d14',
                border: '1px solid #28334e',
                color: '#ffffff',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
                TARGET CAREER ROLE
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: '#0a0d14',
                  border: '1px solid #28334e',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Full Stack Software Engineer">Full Stack Software Engineer</option>
                <option value="Backend Developer (Python/Node)">Backend Developer (Python/Node)</option>
                <option value="Frontend Developer (React/Next.js)">Frontend Developer (React/Next.js)</option>
                <option value="Data Scientist / AI Engineer">Data Scientist / AI Engineer</option>
                <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '0.9rem',
              fontWeight: '800',
              fontSize: '0.98rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing…' : (isRegister ? 'Create My Account →' : 'Sign In to Dashboard →')}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#28334e' }} />
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#28334e' }} />
        </div>

        {/* Instant Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoClick}
          disabled={loading}
          style={{
            width: '100%',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#a5b4fc',
            borderRadius: '14px',
            padding: '0.85rem',
            fontWeight: '800',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span>⚡</span>
          <span>Instant Demo Student Access (One Click)</span>
        </button>

        {/* Switch Mode Toggle */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: '800', cursor: 'pointer', padding: 0 }}
              >
                Log In
              </button>
            </>
          ) : (
            <>
              New to PlaceAI?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: '800', cursor: 'pointer', padding: 0 }}
              >
                Sign Up Here
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
