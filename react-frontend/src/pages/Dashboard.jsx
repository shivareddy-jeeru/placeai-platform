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

  const handleStartAnalysisClick = () => {
    if (session) {
      navigate('/analysis');
    } else {
      triggerUpload();
    }
  };

  return (
    <div className="dashboard-landing-container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '1rem 0 4rem 0' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── TOP NAVBAR ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '900', fontSize: '1.35rem', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>⚡</div>
          <div>
            <span style={{ fontWeight: '900', fontSize: '1.4rem', color: '#0f172a', letterSpacing: '-0.03em' }}>PlaceAI</span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '-2px' }}>AI Placement Assistant</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: '800' }}>
            👋 Hello <span style={{ color: '#4f46e5' }}>{profile?.name || 'Chandana'}</span>
          </span>
          <button onClick={() => navigate('/analysis')} style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: '10px', padding: '0.6rem 1.25rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            📊 View Analysis Hub
          </button>
        </div>
      </div>

      {/* ─── HUGE HERO LANDING SECTION (NOTION / LINEAR STYLE) ───── */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        borderRadius: '28px',
        padding: '3.5rem 4rem',
        boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.35)',
        color: '#ffffff',
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: '3rem',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', color: '#ffffff', fontSize: '0.75rem', fontWeight: '900', padding: '0.4rem 1.1rem', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            🚀 READY TO CRACK PLACEMENTS?
          </span>
          <h1 style={{ fontSize: '2.85rem', fontWeight: '900', lineHeight: '1.15', color: '#ffffff', margin: '0 0 1.25rem 0', letterSpacing: '-0.03em' }}>
            Upload your resume and discover your placement readiness in less than 30 seconds.
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 1.5rem', marginBottom: '2.25rem', fontSize: '0.92rem', color: 'rgba(255,255,255,0.92)', fontWeight: '700' }}>
            <span>• ATS Score Evaluation</span>
            <span>• Skill Gap Analysis</span>
            <span>• Job Matches</span>
            <span>• Personalized Roadmap</span>
            <span>• AI Interview Feedback</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={triggerUpload}
              style={{
                background: '#ffffff',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '14px',
                padding: '1rem 2.25rem',
                fontSize: '1.05rem',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.18)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.2s ease'
              }}
            >
              ☁️ Upload Resume
            </button>

            <button
              onClick={handleStartAnalysisClick}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1.5px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '1rem 2rem',
                fontSize: '1.05rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.2s ease'
              }}
            >
              ⚡ Start Analysis ➔
            </button>
          </div>
        </div>

        {/* Right Illustration Card */}
        <div style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '24px', padding: '2.25rem', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ffffff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: '900' }}>🎯</div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8, fontWeight: '800' }}>AI Instant Scanner</span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '900', margin: 0, color: '#ffffff' }}>Recruiter-grade Evaluation</h4>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.12)', borderRadius: '14px', padding: '1.25rem', fontSize: '0.88rem', lineHeight: 1.5, fontWeight: '600' }}>
            PlaceAI analyzes your formatting, computes keyword alignment against top companies, and generates an action-oriented study roadmap.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', opacity: 0.9, fontWeight: '700' }}>
            <span>✓ PDF / DOCX / TXT</span>
            <span>✓ 100% Confidential</span>
          </div>
        </div>
      </div>

      {/* ─── WHAT YOU'LL GET SECTION (NOTION CLEAN GRID) ─────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.03em' }}>
            What you'll get
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, fontWeight: '600' }}>
            Everything you need to benchmark your skills and crack technical placement interviews.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.75rem', marginTop: '1rem' }}>
          
          {/* Card 1 */}
          <div 
            onClick={() => navigate('/analysis')}
            style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(79,70,229,0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>📄</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>ATS Score</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                Get an instant ATS compatibility rating with section-by-section formatting and keyword recommendations.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: '800', marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>Explore ATS Score ➔</span>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => navigate('/analysis')}
            style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>🎯</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Skill Gap</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                Pinpoint missing technical competencies categorized into Critical, High, and Medium study priorities.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '800', marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>Inspect Skill Gaps ➔</span>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => navigate('/analysis')}
            style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>💼</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Job Matches</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                Benchmark your profile against live job descriptions from Google, Amazon, Infosys, and top tech companies.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '800', marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>View Job Matches ➔</span>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => navigate('/analysis')}
            style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>🗺️</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Roadmap</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                Follow a week-by-week technical curriculum with curated learning resources and capstone project tasks.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: '800', marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>Open Roadmap ➔</span>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => navigate('/analysis')}
            style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>AI Mentor</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                Chat 24/7 with your dedicated AI placement coach to clarify technical concepts and interview questions.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '800', marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>Chat with Mentor ➔</span>
          </div>

          {/* Card 6 */}
          <div 
            onClick={() => navigate('/analysis')}
            style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236,72,153,0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>🎤</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Interview Coach</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                Practice real-time technical, STAR behavioral, and HR interview scenarios evaluated with instant scoring.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#ec4899', fontWeight: '800', marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>Start Interview Practice ➔</span>
          </div>

        </div>
      </div>

      {/* ─── RECENT ANALYSIS HISTORY (IF EXISTS) ────────────────────── */}
      {history && history.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 1rem 0' }}>Recent Analysis History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.slice(0, 3).map((item, index) => (
              <div key={index} onClick={() => navigate('/analysis')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>📄</span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{item.filename || 'Resume_Audit.pdf'}</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>Analyzed {item.uploadDate || 'Recently'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '900', color: '#4f46e5' }}>{item.atsScore || 84}% ATS</span>
                  <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: '800' }}>View ➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
