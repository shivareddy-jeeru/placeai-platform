import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/* ─── Dark Theme Circular Score Donut ──────────────────────── */
const ScoreDonut = ({ pct, size = 110, stroke = 12, color = '#6366f1', bg = '#1e2438', label }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.65rem', fontWeight: '900', color: '#ffffff', lineHeight: 1 }}>{pct}%</span>
        {label && <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px', fontWeight: '700' }}>{label}</span>}
      </div>
    </div>
  );
};

/* ─── Dark Theme Progress Bar ─────────────────────────────── */
const ProgressBar = ({ label, pct, color = '#6366f1' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '700', color: '#e2e8f0' }}>
      <span>{label}</span>
      <span>{pct}%</span>
    </div>
    <div style={{ height: '6px', background: '#1e2438', borderRadius: '3px', overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
    </div>
  </div>
);

/* ─── Mini Sparkline svg ────────────────────────────────────── */
const Sparkline = ({ color = '#6366f1', up = true }) => {
  const pts = up
    ? '0,20 10,12 20,15 30,8 40,11 50,4 60,6 70,2'
    : '0,5 10,12 20,8 30,15 40,11 50,18 60,14 70,20';
  return (
    <svg width="70" height="22" viewBox="0 0 70 22" style={{ display: 'block' }}>
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Illustrated Mountain Pathway ─────────────────────────── */
const MountainIllustration = () => (
  <svg viewBox="0 0 240 130" width="100%" height="130" style={{ display: 'block' }}>
    <defs>
      <linearGradient id="pathGradient" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="mountainGrad" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    {/* Mountains background */}
    <path d="M 0,130 L 70,60 L 120,100 L 190,30 L 240,80 L 240,130 Z" fill="url(#mountainGrad)" opacity="0.5" />
    <path d="M 30,130 L 100,50 L 150,90 L 210,20 L 240,55 L 240,130 Z" fill="url(#mountainGrad)" />
    
    {/* Winding road path */}
    <path
      d="M 10,130 C 50,120 70,105 50,90 C 25,70 120,75 110,50 C 100,30 190,40 210,20"
      fill="none"
      stroke="url(#pathGradient)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <path
      d="M 10,130 C 50,120 70,105 50,90 C 25,70 120,75 110,50 C 100,30 190,40 210,20"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1"
      strokeDasharray="4 4"
      strokeLinecap="round"
    />

    {/* Target Flag at Peak */}
    <g transform="translate(210, 20)">
      <line x1="0" y1="0" x2="0" y2="-18" stroke="#ef4444" strokeWidth="2" />
      <path d="M 0,-18 L 12,-13 L 0,-8 Z" fill="#ef4444" />
      <circle cx="0" cy="0" r="2" fill="#ef4444" />
    </g>
  </svg>
);

/* ═══════════════════════════════════════════════════════════════ */
/* DASHBOARD COMPONENT                                             */
/* ═══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { profile, session, activeJobs, startNewAnalysis, history, notifications, setNotifications, resetSession } = useSession();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(profile?.preferredRole || 'Software Engineer');
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const d_name = profile?.name || 'Shiva';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showChatWindow]);

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await startNewAnalysis(file, '');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = { id: Date.now(), text: chatInput, sender: 'user' };
    setChatMessages(p => [...p, msg]);
    const q = chatInput;
    setChatInput('');
    setChatLoading(true);
    try {
      const sid = session?.sessionId || localStorage.getItem('session_id');
      const res = sid ? await api.queryChat(sid, q) : null;
      setChatMessages(p => [
        ...p,
        {
          id: Date.now() + 1,
          text: res?.data?.response || 'Ask me about your ATS score, skill gaps, or mock interview prep!',
          sender: 'ai'
        }
      ]);
    } catch {
      setChatMessages(p => [
        ...p,
        {
          id: Date.now() + 1,
          text: 'Feel free to ask about your resume improvements, matching indices, or learning roadmap!',
          sender: 'ai'
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // 7 feature cards for continuous infinite scroll
  const featuresList = [
    { title: 'Resume Analyzer', desc: 'Get ATS score, feedback and improve your resume.', route: '/resume', icon: '📄', color: '#6366f1' },
    { title: 'Job Matcher', desc: 'Find the best job roles that match your profile.', route: '/matcher', icon: '💼', color: '#10b981' },
    { title: 'Skill Gap Analysis', desc: 'Identify gaps and get actionable suggestions.', route: '/skills', icon: '📊', color: '#f59e0b' },
    { title: 'Learning Roadmap', desc: 'Personalised roadmap to close your skill gaps.', route: '/roadmap', icon: '🗺️', color: '#8b5cf6' },
    { title: 'AI Interview Coach', desc: 'Practice interviews and get AI feedback.', route: '/interview', icon: '🎤', color: '#06b6d4' },
    { title: 'Progress Analytics', desc: 'Track your progress and improvement over time.', route: '/progress', icon: '📈', color: '#ec4899' },
    { title: 'AI Placement Mentor', desc: 'Get AI guidance at every step of your journey.', route: '/assistant', icon: '🤖', color: '#a855f7' }
  ];

  const runningJob = Object.values(activeJobs)[0];
  if (runningJob) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc', width: '100%', padding: '2rem' }}>
        <div className="spinner" style={{ borderTopColor: '#6366f1', width: '3rem', height: '3rem' }} />
        <h3 style={{ color: '#0f172a', fontWeight: 800 }}>Analyzing your resume…</h3>
        <div style={{ width: '320px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${runningJob.progress}%`, height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>{runningJob.progress}% Complete</span>
      </div>
    );
  }

  return (
    <div className="dashboard-dark-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', minHeight: '100%' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── HORIZONTAL HEADER BAR ───────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#161925', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '0.85rem 1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '900', fontSize: '1.15rem' }}>⚡</div>
          <div>
            <span style={{ fontWeight: '900', fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.02em' }}>PlaceAI</span>
            <span style={{ display: 'block', fontSize: '0.62rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '-2px' }}>AI Placement Assistant</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          {/* Notification bell and dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
              title="Notifications"
            >
              🔔
              {notifications && notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#ffffff', fontSize: '0.6rem', fontWeight: '900', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                width: '320px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                zIndex: 1001,
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }}>Notifications & Alerts</span>
                  <button
                    onClick={() => { setNotifications([]); setShowNotifications(false); }}
                    style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                  {(!notifications || notifications.length === 0) ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ padding: '0.6rem 0.75rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#0f172a', fontWeight: '600', lineHeight: 1.4 }}>{n.text}</p>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '3px', display: 'block' }}>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: '10px', padding: '0.55rem 1.1rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            📥 Export Report
          </button>
          
          <button
            onClick={resetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              borderRadius: '10px',
              padding: '0.55rem 1.1rem',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
            title="Clear and reset active resume and job details"
          >
            🔄 Reset Session
          </button>

          <button onClick={triggerUpload} style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.55rem 1.35rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
            ☁️ Upload Resume
          </button>
        </div>
      </div>

      {/* ─── GENERAL PLACEMENT HEADER ─────────────────────────────── */}
      <div style={{ marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>
          Placement Readiness Overview 🚀
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '6px 0 0 0', fontWeight: '600' }}>
          Select a placement module below to analyze your profile, generate learning roadmaps, or practice mock interviews.
        </p>
      </div>

      {/* ─── ROW 1: SLEEK KPI METRIC CARDS (4 COLUMNS) ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        
        {/* Metric 1 */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', fontWeight: '900' }}>📄</div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resumes Analyzed</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>{history.length}</div>
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700' }}>↑ 3 this week</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', fontWeight: '900' }}>🧠</div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills Extracted</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>{session ? (session.extractedSkills?.length || 15) : 15}</div>
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700' }}>↑ 15 competencies</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', fontWeight: '900' }}>🎯</div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Job Matches</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>{session ? (session.jobMatches?.length || 8) : 8}</div>
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700' }}>↑ High alignment</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', fontWeight: '900' }}>📈</div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Readiness Score</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>{session ? `${session.placementReadiness || 82}%` : '82%'}</div>
            <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700' }}>↑ Placement Ready</span>
          </div>
        </div>

      </div>

      {/* ─── ROW 2: 4 CLEAN MODULAR ACTION CARDS (2x2 GRID) ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
        
        {/* Module 1: Resume Analyzer */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>📄</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Resume Analyzer & ATS Audit</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              Upload your PDF/DOCX resume to extract skill trees, calculate ATS readability scores, and get recruiter-grade optimization tips.
            </p>
          </div>
          <button 
            onClick={() => navigate('/resume')}
            style={{
              marginTop: '1.5rem',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: 'fit-content',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            Open Resume Analyzer ➔
          </button>
        </div>

        {/* Module 2: Job Description Matcher */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>💼</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Job Description Matcher</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              Paste target job descriptions to evaluate capability alignment, flag missing keywords, and benchmark your match score.
            </p>
          </div>
          <button 
            onClick={() => navigate('/matcher')}
            style={{
              marginTop: '1.5rem',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: 'fit-content',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            Open Job Matcher ➔
          </button>
        </div>

        {/* Module 3: Skill Gaps & Roadmap */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>🗺️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Skill Gaps & Learning Roadmap</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              Discover missing technical competencies categorized into Beginner, Intermediate, and Advanced tiers with personalized study paths.
            </p>
          </div>
          <button 
            onClick={() => navigate('/roadmap')}
            style={{
              marginTop: '1.5rem',
              background: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: 'fit-content',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            Open Learning Roadmap ➔
          </button>
        </div>

        {/* Module 4: AI Mock Interview Coach */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #8b5cf6, #c084fc)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>🤖</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>AI Mock Interview Coach</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              Practice technical, behavioral, and project-specific mock interview questions evaluated in real-time by AI interview agents.
            </p>
          </div>
          <button 
            onClick={() => navigate('/assistant')}
            style={{
              marginTop: '1.5rem',
              background: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem 1.5rem',
              fontSize: '0.95rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: 'fit-content',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            Launch Mock Interview ➔
          </button>
        </div>

      </div>

      {/* ─── Role Picker Modal ─── */}
      {showRoleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', width: '400px', boxShadow: '0 20px 30px rgba(0,0,0,0.15)', color: '#0f172a' }}>
            <h3 style={{ color: '#0f172a', margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '900' }}>🎯 Choose Your Target Role</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.25rem 0', fontWeight: '600' }}>Select the role you want AI to benchmark your resume against:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'ML Engineer', 'Backend Developer', 'DevOps Engineer'].map(role => (
                <div key={role} onClick={() => { setSelectedRole(role); setShowRoleModal(false); }}
                  style={{ padding: '0.75rem 1rem', background: selectedRole === role ? 'rgba(79,70,229,0.08)' : '#f8fafc', border: `1px solid ${selectedRole === role ? '#4f46e5' : '#e2e8f0'}`, borderRadius: '10px', color: '#0f172a', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{role}</span>
                  {selectedRole === role && <span style={{ color: '#4f46e5', fontWeight: '900' }}>✓</span>}
                </div>
              ))}
            </div>
            <button onClick={() => setShowRoleModal(false)} style={{ width: '100%', padding: '0.7rem', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700' }}>Close</button>
          </div>
        </div>
      )}

      {/* ─── FLOATING CHAT WIDGET ─── */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        
        {/* Chat window panel */}
        {showChatWindow && (
          <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '16px', padding: '1rem', width: '320px', height: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🤖</span>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffffff' }}>AI Placement Mentor</span>
                  <span style={{ display: 'block', fontSize: '0.55rem', color: '#22c55e', fontWeight: '700' }}>● Online</span>
                </div>
              </div>
              <button onClick={() => setShowChatWindow(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800' }}>✕</button>
            </div>

            {/* Message Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '0.2rem' }}>
              <div style={{ alignSelf: 'flex-start', background: '#1e2438', color: '#e2e8f0', padding: '0.5rem 0.75rem', borderRadius: '10px 10px 10px 0', fontSize: '0.72rem', maxWidth: '85%', lineHeight: 1.4 }}>
                Hi {d_name}! 👋 I can help you find match indices, analyze skill gaps, or draft responses. Ask me anything!
              </div>
              
              {chatMessages.map(msg => (
                <div key={msg.id} style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : '#1e2438',
                  color: '#ffffff',
                  padding: '0.5rem 0.75rem',
                  borderRadius: msg.sender === 'user' ? '10px 10px 0 10px' : '10px 10px 10px 0',
                  fontSize: '0.72rem',
                  maxWidth: '85%',
                  lineHeight: 1.4
                }}>{msg.text}</div>
              ))}
              {chatLoading && <div style={{ alignSelf: 'flex-start', background: '#1e2438', color: '#94a3b8', padding: '0.45rem 0.75rem', borderRadius: '10px', fontSize: '0.68rem' }}>Typing…</div>}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <input
                type="text"
                placeholder="Ask AI Mentor anything..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                style={{ flex: 1, background: '#12141f', border: '1px solid #2d3342', borderRadius: '8px', padding: '0.45rem 0.65rem', color: '#ffffff', fontSize: '0.75rem', outline: 'none' }}
              />
              <button onClick={handleSendChat} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0 0.85rem', cursor: 'pointer', fontSize: '0.85rem' }}>➔</button>
            </div>
          </div>
        )}

        {/* Floating Bubble Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!showChatWindow && (
            <div style={{ background: '#0f172a', color: '#ffffff', fontSize: '0.68rem', fontWeight: '800', padding: '0.35rem 0.75rem', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', pointerEvents: 'none' }}>
              Ask AI Mentor
            </div>
          )}
          <div onClick={() => setShowChatWindow(!showChatWindow)} style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(99,102,241,0.45)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            🤖
          </div>
        </div>

      </div>

    </div>
  );
}
