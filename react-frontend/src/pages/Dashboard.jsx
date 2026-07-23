import React, { useState, useRef } from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { profile, session, history, startNewAnalysis, resetSession } = useSession();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'ATS Evaluation completed for Shiva_Reddy_Resume.pdf (Score: 87%)', time: '10m ago' },
    { id: 2, text: '3 New Job Matches found for Full Stack Engineer role', time: '1h ago' }
  ]);

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await startNewAnalysis(file, '');
        navigate('/analysis');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── TOP HEADER BAR ─────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.25rem 0', letterSpacing: '-0.02em' }}>
            Placement Readiness Dashboard 🎯
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, fontWeight: '600' }}>
            Intelligent AI assessment, skill gap detection, job matching, and technical roadmap.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          {/* Notification bell and dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                cursor: 'pointer',
                fontSize: '1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: '#ffffff', fontSize: '0.55rem', fontWeight: '900', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Dropdown list */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                width: '320px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                zIndex: 1001,
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>Notifications</span>
                  <button
                    onClick={() => { setNotifications([]); setShowNotifications(false); }}
                    style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '220px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.4, fontWeight: '600' }}>{n.text}</p>
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px', display: 'block' }}>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={resetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              borderRadius: '12px',
              padding: '0.7rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
            title="Reset active session and all metrics back to 0"
          >
            🔄 Reset to 0
          </button>

          <button
            onClick={triggerUpload}
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.7rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            ☁️ Upload Resume
          </button>
        </div>
      </div>

      {/* ─── 1. TOP METRIC KPI CARDS ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {[
          { label: 'Resumes Analyzed', val: history?.length || 0, sub: history?.length ? '↑ Active' : '0 Resumes', color: '#4f46e5', icon: '📄' },
          { label: 'Average ATS Score', val: session ? `${session.atsScore || 0}%` : '0%', sub: session ? 'Evaluated' : '0% Score', color: '#10b981', icon: '🎯' },
          { label: 'Matched Job Roles', val: session ? `${session.jobMatches?.length || 0} Roles` : '0 Roles', sub: session ? 'Google, Amazon, Azure' : '0 Matches', color: '#3b82f6', icon: '💼' },
          { label: 'Learning Roadmap', val: session ? 'Week 2 of 4' : '0 Tasks', sub: session ? '3 Tasks Active' : '0% Complete', color: '#8b5cf6', icon: '🗺️' }
        ].map((kpi, idx) => (
          <div key={idx} style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '18px',
            padding: '1.35rem 1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.15rem'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              {kpi.icon}
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</span>
              <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0f172a', margin: '2px 0' }}>{kpi.val}</div>
              <span style={{ fontSize: '0.72rem', color: kpi.color, fontWeight: '700' }}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 2. CORE FEATURE ACTION CARDS (2x2 GRID) ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
        
        {/* Feature 1: Resume Analyzer */}
        <div 
          onClick={() => navigate('/resume')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '2.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#4f46e5';
            e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(79,70,229,0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(79,70,229,0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📄</div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Resume Analyzer & ATS Audit</h3>
                <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: '800' }}>Instant Recruiter Benchmark</span>
              </div>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
              Run comprehensive ATS compatibility audits, inspect section formatting, and get exact keyword optimization tips.
            </p>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: '800', marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            Explore Resume Analyzer ➔
          </span>
        </div>

        {/* Feature 2: Job Matcher */}
        <div 
          onClick={() => navigate('/matcher')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '2.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#10b981';
            e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(16,185,129,0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💼</div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Job Description Matcher</h3>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800' }}>Company Compatibility Index</span>
              </div>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
              Cross-reference your active resume with custom job requirements from Google, Amazon, and Infosys to inspect semantic fit.
            </p>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '800', marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            View Job Matches ➔
          </span>
        </div>

        {/* Feature 3: Skill Gap Analysis */}
        <div 
          onClick={() => navigate('/skills')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '2.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#f59e0b';
            e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(245,158,11,0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📊</div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Skill Gap Analysis</h3>
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '800' }}>Competency Priorities</span>
              </div>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
              Pinpoint missing technical competencies categorized into Critical, High, and Medium study priorities.
            </p>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: '800', marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            Inspect Skill Gaps ➔
          </span>
        </div>

        {/* Feature 4: Learning Roadmap */}
        <div 
          onClick={() => navigate('/roadmap')}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '2.25rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = '#8b5cf6';
            e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(139,92,246,0.18)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🗺️</div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>4-Week Learning Roadmap</h3>
                <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '800' }}>Structured Curriculum</span>
              </div>
            </div>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
              Follow a week-by-week technical curriculum engineered with checkable study tasks and capstone milestones.
            </p>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#8b5cf6', fontWeight: '800', marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            Open Learning Roadmap ➔
          </span>
        </div>

      </div>

      {/* ─── 3. ACTIVE CANDIDATE SUMMARY CARD ───────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '2rem 2.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900' }}>
            S
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{profile?.name || 'Shiva Reddy'}</h3>
              <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.65rem', borderRadius: '999px' }}>
                Active Session
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '3px 0 0 0', fontWeight: '600' }}>
              Role: <strong style={{ color: '#0f172a' }}>{profile?.preferredRole || 'Software Engineer'}</strong> • Target: <strong style={{ color: '#0f172a' }}>Google / Infosys</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/analysis')}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        >
          📊 View Full Analysis Hub ➔
        </button>
      </div>

    </div>
  );
}
