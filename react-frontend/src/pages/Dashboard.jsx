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
                background: '#12141f',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#ffffff',
                borderRadius: '10px',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1c1f2e'}
              onMouseLeave={e => e.currentTarget.style.background = '#12141f'}
            >
              🔔
              {notifications && notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: '#ffffff', fontSize: '0.55rem', fontWeight: '900', borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Dropdown list */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '45px',
                right: '0',
                background: '#161925',
                border: '1px solid #2d3342',
                borderRadius: '12px',
                width: '280px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                zIndex: 1001,
                padding: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.75rem', color: '#ffffff' }}>Notifications</span>
                  <button
                    onClick={() => { setNotifications([]); setShowNotifications(false); }}
                    style={{ background: 'none', border: 'none', color: '#a5b4fc', fontSize: '0.62rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {(!notifications || notifications.length === 0) ? (
                    <div style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.68rem' }}>No new notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ padding: '0.45rem', background: '#1e2233', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ margin: 0, fontSize: '0.68rem', color: '#e2e8f0', lineHeight: 1.35 }}>{n.text}</p>
                        <span style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '2px', display: 'block' }}>{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button style={{ background: '#12141f', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', borderRadius: '10px', padding: '0.5rem 1.1rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            📥 Export Report
          </button>
          
          <button
            onClick={resetSession}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              borderRadius: '10px',
              padding: '0.5rem 1.1rem',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
            title="Clear and reset active resume and job details"
          >
            🔄 Reset Session
          </button>

          <button onClick={triggerUpload} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }}>
            ☁️ Upload Resume
          </button>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '800', fontSize: '0.95rem' }}>{d_name[0].toUpperCase()}</div>
        </div>
      </div>

      {/* ─── WELCOME SUBHEADER ────────────────────────────────────── */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
          {greeting}, <span style={{ color: '#8b5cf6' }}>{d_name}!</span> 👋
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '3px 0 0 0', fontWeight: '600' }}>Your placement journey, intelligently organized.</p>
      </div>

      {/* ─── ROW 1: HERO BANNER & RESUME READINESS ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(340px, 0.9fr)', gap: '1.25rem' }}>
        
        {/* Left: Illustrated Hero Card */}
        <div className="dark-dashboard-card" style={{ display: 'flex', background: 'linear-gradient(135deg, #1b1642 0%, #0e0d22 100%)', border: '1px solid #4f46e5', position: 'relative', overflow: 'hidden', minHeight: '190px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, paddingRight: '1rem' }}>
            <span style={{ display: 'inline-flex', width: 'fit-content', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', fontSize: '0.62rem', fontWeight: '900', padding: '0.25rem 0.65rem', borderRadius: '999px', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              ✨ PlaceAI - Your Placement Assistant
            </span>
            <h3 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.35rem 0', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Understand where you stand.
            </h3>
            <h3 style={{ fontSize: '1.85rem', fontWeight: '900', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.75rem 0', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Build where you want to go.
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 1rem 0', lineHeight: 1.45, maxWidth: '440px' }}>
              Analyze your profile and get a personalized path to placement readiness.
            </p>
            <button onClick={triggerUpload} style={{ background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.55rem 1.35rem', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', width: 'fit-content', boxShadow: '0 4px 10px rgba(99,102,241,0.25)', transition: 'all 0.2s' }}>
              Analyze My Resume ➔
            </button>
          </div>
          {/* Vector Road/Hill Illustration on Right */}
          <div style={{ width: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.95, pointerEvents: 'none' }}>
            <MountainIllustration />
          </div>
        </div>

        {/* Right: Resume Readiness Card */}
        <div className="dark-dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <span>Resume Readiness</span>
            <span style={{ color: '#64748b', cursor: 'pointer' }} title="Overall evaluated score from extracted metrics">ⓘ</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', flex: 1 }}>
            <ScoreDonut pct={session ? (session.placementReadiness || 82) : 0} size={92} stroke={10} color="#6366f1" label="Overall Score" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
              <ProgressBar label="Skills" pct={session ? 80 : 0} color="#8b5cf6" />
              <ProgressBar label="Projects" pct={session ? 70 : 0} color="#3b82f6" />
              <ProgressBar label="Experience" pct={session ? 60 : 0} color="#06b6d4" />
              <ProgressBar label="Communication" pct={session ? 90 : 0} color="#ec4899" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: session ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${session ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '8px', padding: '0.45rem 0.65rem', fontSize: '0.68rem', color: session ? '#34d399' : '#94a3b8', fontWeight: '600' }}>
            <span style={{ fontSize: '0.95rem' }}>{session ? '✓' : 'ℹ'}</span>
            <span>{session ? "Great progress! You're on the right track to become placement ready." : "No active resume analyzed. Upload a resume to get placement readiness insights."}</span>
          </div>
        </div>
      </div>

      {/* ─── ROW 2: KPI METRIC CARDS ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.85rem' }}>
        
        {/* Card 1: Target Role */}
        <div className="dark-dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.15rem', flexShrink: 0, justifyContent: 'center' }}>💼</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target Role</span>
            <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedRole}</div>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginTop: '1px' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Full Stack Dev</span>
              <button onClick={() => setShowRoleModal(true)} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.62rem', fontWeight: '800', padding: 0, cursor: 'pointer' }}>Change ➔</button>
            </div>
          </div>
        </div>

        {/* Card 2: Resumes Analyzed */}
        <div className="dark-dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.15rem', flexShrink: 0, justifyContent: 'center' }}>📄</div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Resumes Analyzed</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff' }}>{history.length}</span>
              <span style={{ fontSize: '0.62rem', color: '#34d399', fontWeight: '700' }}>↑ 3 this week</span>
            </div>
            <div style={{ marginTop: '2px' }}><Sparkline color="#a855f7" up={true} /></div>
          </div>
        </div>

        {/* Card 3: Skills Extracted */}
        <div className="dark-dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.15rem', flexShrink: 0, justifyContent: 'center' }}>🧠</div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skills Extracted</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff' }}>{session ? (session.extractedSkills?.length || 0) : 0}</span>
              <span style={{ fontSize: '0.62rem', color: '#34d399', fontWeight: '700' }}>↑ 15 this week</span>
            </div>
            <div style={{ marginTop: '2px' }}><Sparkline color="#3b82f6" up={true} /></div>
          </div>
        </div>

        {/* Card 4: Job Matches */}
        <div className="dark-dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.15rem', flexShrink: 0, justifyContent: 'center' }}>🎯</div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Job Matches</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff' }}>{session ? (session.jobMatches?.length || 8) : 0}</span>
              <span style={{ fontSize: '0.62rem', color: '#34d399', fontWeight: '700' }}>↑ 2 this week</span>
            </div>
            <div style={{ marginTop: '2px' }}><Sparkline color="#10b981" up={true} /></div>
          </div>
        </div>

        {/* Card 5: Average Readiness */}
        <div className="dark-dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.15rem', flexShrink: 0, justifyContent: 'center' }}>📈</div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Average Readiness</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff' }}>{session ? `${session.placementReadiness || 76}%` : '0%'}</span>
              <span style={{ fontSize: '0.62rem', color: '#34d399', fontWeight: '700' }}>↑ 8% this week</span>
            </div>
            <div style={{ marginTop: '2px' }}><Sparkline color="#f59e0b" up={true} /></div>
          </div>
        </div>
      </div>

      {/* ─── ROW 3: PLACEMENT JOURNEY & NEXT BEST ACTION/SKILL GAPS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, 0.8fr)', gap: '1.25rem' }}>
        
        {/* Left Column: Placement Journey */}
        <div className="dark-dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Your Placement Journey</div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Track your active progress metrics and milestones.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', padding: '0.5rem 0' }}>
            {/* Connector Line */}
            <div style={{ position: 'absolute', left: '8%', right: '8%', top: '22px', height: '2px', background: `linear-gradient(90deg, #10b981 0%, ${session ? '#10b981' : '#1e2438'} 50%, #1e2438 100%)`, zIndex: 0 }} />
            
            {[
              { label: 'Resume', icon: '📄', active: !!session, done: !!session },
              { label: 'Match', icon: '🎯', active: !!session, done: !!session },
              { label: 'Skills', icon: '⚡', active: !!session, done: !!session },
              { label: 'Roadmap', icon: '🗺️', active: false, done: false },
              { label: 'Interview', icon: '🎤', active: false, done: false },
            ].map((step, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem', zIndex: 1 }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: step.done ? 'rgba(255,255,255,0.05)' : '#12141f',
                  border: `2px solid ${step.done ? '#10b981' : '#2d3342'}`,
                  boxShadow: step.done ? '0 4px 10px rgba(16,185,129,0.15)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem'
                }}>
                  {step.icon}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: step.active ? '#ffffff' : '#64748b' }}>{step.label}</span>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: step.done ? '#ffffff' : '#12141f',
                  border: `1.5px solid ${step.done ? '#10b981' : '#2d3342'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.55rem',
                  color: '#10b981',
                  fontWeight: '900'
                }}>
                  {step.done ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', background: '#12141f', padding: '0.65rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            Complete each step to strengthen your profile and boost your placement readiness.
          </div>
        </div>

        {/* Right Column: Next Best Action & Top Skill Gaps (Stacked) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Card: Next Best Action */}
          <div className="dark-dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: `1px solid ${session ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`, background: session ? 'linear-gradient(135deg, #12141f 0%, rgba(20, 83, 45, 0.25) 100%)' : '#12141f' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: session ? 'rgba(34, 197, 94, 0.12)' : '#1e2438', border: `1.5px solid ${session ? '#22c55e' : '#2d3342'}`, display: 'flex', alignItems: 'center', justify: 'center', fontSize: '1.25rem', flexShrink: 0, justifyContent: 'center' }}>🎯</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Next Best Action</span>
              <div style={{ fontSize: '0.85rem', fontWeight: '900', color: '#ffffff', marginBottom: '0.15rem' }}>{session ? 'Improve System Design' : 'No Active Action'}</div>
              <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>{session ? 'You have 3 critical skill gaps for your target role.' : 'Upload your resume to start.'}</p>
            </div>
            {session && (
              <button onClick={() => navigate('/roadmap')} style={{ background: '#15803d', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.68rem', fontWeight: '800', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 8px rgba(22,101,52,0.15)' }}>
                Start Learning ➔
              </button>
            )}
          </div>

          {/* Card: Top Skill Gaps */}
          <div className="dark-dashboard-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Top Skill Gaps</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { name: 'System Design', level: 'Low', pct: session ? 28 : 0, color: '#ef4444' },
                { name: 'Design Patterns', level: 'Medium', pct: session ? 54 : 0, color: '#f59e0b' },
                { name: 'SQL Advanced', level: 'Medium', pct: session ? 60 : 0, color: '#f59e0b' }
              ].map((gap, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.45rem 0.65rem', background: '#12141f', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '2px' }}>
                      <span>{gap.name}</span>
                      <span style={{ fontSize: '0.62rem', color: gap.color }}>{session ? `${gap.level} Match (${gap.pct}%)` : '0%'}</span>
                    </div>
                    <div style={{ height: '4px', background: '#1e2438', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${gap.pct}%`, height: '100%', background: gap.color, borderRadius: '2px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ─── ROW 4: AI INSIGHT BANNER ──────────────────────────────── */}
      <div className="dark-dashboard-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(90deg, #1e1b4b 0%, #31105e 100%)', border: '1px solid #581c87', padding: '1rem 1.5rem', position: 'relative' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem', flexShrink: 0 }}>✨</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.62rem', color: '#c084fc', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '2px' }}>AI Insight</span>
          <p style={{ fontSize: '0.8rem', color: '#e9d5ff', margin: 0, fontWeight: '700', lineHeight: 1.4 }}>
            Students with similar profiles who focused on <strong style={{ color: '#d8b4fe' }}>System Design & DSA</strong> got <strong style={{ color: '#d8b4fe' }}>78% more interviews.</strong>
          </p>
          <button onClick={() => navigate('/roadmap')} style={{ background: 'none', border: 'none', color: '#c084fc', fontSize: '0.72rem', fontWeight: '800', padding: 0, marginTop: '0.25rem', cursor: 'pointer', textDecoration: 'underline' }}>
            View Personalized Roadmap ➔
          </button>
        </div>
        
        {/* Floating Robot Icon on Right */}
        <div style={{ position: 'absolute', right: '2rem', bottom: '-5px', height: '90px', width: '90px', display: 'flex', alignItems: 'flex-end', pointerEvents: 'none' }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
              <linearGradient id="roboBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="32" fill="url(#roboBody)" opacity="0.15" />
            <circle cx="50" cy="50" r="26" fill="url(#roboBody)" />
            {/* Eyes */}
            <ellipse cx="40" cy="48" rx="4" ry="2" fill="#ffffff" />
            <ellipse cx="60" cy="48" rx="4" ry="2" fill="#ffffff" />
            <path d="M 44,60 Q 50,65 56,60" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Antennas */}
            <line x1="50" y1="24" x2="50" y2="14" stroke="url(#roboBody)" strokeWidth="3" />
            <circle cx="50" cy="12" r="4" fill="#a855f7" />
          </svg>
        </div>
      </div>

      {/* ─── ROW 5: EXPLORE PLACEAI FEATURES (INFINITE MARQUEE) ───── */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
          Explore PlaceAI Features
        </div>
        
        <div className="feature-marquee">
          <div className="feature-marquee-track">
            {/* Duplicated to create seamless loop */}
            {[...featuresList, ...featuresList].map((feat, idx) => (
              <div key={idx} onClick={() => navigate(feat.route)} className="feature-marquee-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{feat.icon}</span>
                  <strong style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: '800' }}>{feat.title}</strong>
                </div>
                <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, lineHeight: 1.35, flex: 1 }}>{feat.desc}</p>
                <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: '800', marginTop: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  Explore ➔
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ fontSize: '0.58rem', color: '#64748b', textAlign: 'center', marginTop: '0.55rem', fontWeight: '600' }}>
          ✨ Scroll to explore more features or hover to pause scrolling ✨
        </div>
      </div>

      {/* ─── Role Picker Modal ─── */}
      {showRoleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '16px', padding: '1.75rem', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', color: '#ffffff' }}>
            <h3 style={{ color: '#ffffff', margin: '0 0 0.5rem 0', fontSize: '1.05rem', fontWeight: '900' }}>🎯 Choose Your Target Role</h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 1.25rem 0', fontWeight: '600' }}>Select the role you want AI to benchmark your resume against:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'ML Engineer', 'Backend Developer', 'DevOps Engineer'].map(role => (
                <div key={role} onClick={() => { setSelectedRole(role); setShowRoleModal(false); }}
                  style={{ padding: '0.75rem 1rem', background: selectedRole === role ? '#1f2438' : 'transparent', border: `1px solid ${selectedRole === role ? '#6366f1' : '#2d3342'}`, borderRadius: '9px', color: '#ffffff', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{role}</span>
                  {selectedRole === role && <span style={{ color: '#818cf8', fontWeight: '900' }}>✓</span>}
                </div>
              ))}
            </div>
            <button onClick={() => setShowRoleModal(false)} style={{ width: '100%', padding: '0.65rem', background: '#1a1d2e', border: '1px solid #2d3342', color: '#94a3b8', borderRadius: '9px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' }}>Close</button>
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
