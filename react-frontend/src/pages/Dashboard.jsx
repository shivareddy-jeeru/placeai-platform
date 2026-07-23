import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

/* ─── Vector Icons (Lucide-Style Scalable SVGs) ────────────── */
const IconAts = ({ size = 24, color = '#6366f1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const IconTarget = ({ size = 24, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconBriefcase = ({ size = 24, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const IconMap = ({ size = 24, color = '#8b5cf6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
  </svg>
);

const IconBot = ({ size = 24, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="3" />
    <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="3" />
  </svg>
);

const IconMic = ({ size = 24, color = '#ec4899' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

export default function Dashboard() {
  const { profile, session, activeJobs, startNewAnalysis, history, resetSession } = useSession();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [demoSampleIndex, setDemoSampleIndex] = useState(0);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(profile?.preferredRole || 'Software Engineer');
  const [showChatWindow, setShowChatWindow] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, showChatWindow]);

  const triggerUpload = () => fileInputRef.current?.click();

  const processUploadedFile = async (file) => {
    if (!file) return;
    setSelectedFileName(file.name);
    try {
      await startNewAnalysis(file, '');
      navigate('/analysis');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
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
        { id: Date.now() + 1, text: res?.data?.response || 'Ask me about your ATS score, skill gaps, or mock interview prep!', sender: 'ai' }
      ]);
    } catch {
      setChatMessages(p => [
        ...p,
        { id: Date.now() + 1, text: 'Feel free to ask about your resume improvements, matching indices, or learning roadmap!', sender: 'ai' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const demoSamples = [
    { name: 'Sample Resume (SDE Role)', score: 87, role: 'Full Stack Engineer', missing: ['Docker', 'System Design', 'PostgreSQL Query Tuning'] },
    { name: 'Sample Resume (Data Science)', score: 79, role: 'ML & Data Analyst', missing: ['PyTorch', 'Spark Streaming', 'Kubeflow'] },
    { name: 'Sample Resume (DevOps & Cloud)', score: 92, role: 'Cloud Infrastructure Dev', missing: ['Terraform', 'Kubernetes Helm'] }
  ];

  const currentSample = demoSamples[demoSampleIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 0 5rem 0' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── 1. INTEGRATED NAVBAR ──────────────────────────────────── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        padding: '1.25rem 2rem',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '900', fontSize: '1.4rem', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>⚡</div>
          <div>
            <span style={{ fontWeight: '900', fontSize: '1.45rem', color: '#0f172a', letterSpacing: '-0.03em' }}>PlaceAI</span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '-2px' }}>AI Placement Assistant</span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.92rem', fontWeight: '700', color: '#475569' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/analysis')}>Analysis Hub</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/roadmap')}>Roadmap</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/matcher')}>Job Matches</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => navigate('/interview')}>Interview Coach</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/analysis')} 
            style={{
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.65rem 1.4rem',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            📊 View Analysis Hub
          </button>
        </div>
      </header>

      {/* ─── 2. HERO SECTION & INTERACTIVE DROPZONE ──────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: '28px',
        padding: '4rem 4rem',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)',
        color: '#ffffff',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '3.5rem',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', color: '#a5b4fc', fontSize: '0.78rem', fontWeight: '900', padding: '0.45rem 1.25rem', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            ✨ AI-POWERED PLACEMENT READINESS
          </span>
          <h1 style={{ fontSize: '3.2rem', fontWeight: '900', lineHeight: '1.12', color: '#ffffff', margin: '0 0 1.25rem 0', letterSpacing: '-0.04em' }}>
            Land Your Dream Tech Job in &lt;30 Seconds
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 2.25rem 0', fontWeight: '600', maxWidth: '520px' }}>
            Upload your resume for an instant ATS rating, missing skill gap analysis, custom job matches, and a 4-week structured technical roadmap.
          </p>

          {/* Interactive Drag & Drop Box */}
          <div 
            onClick={triggerUpload}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDraggingOver ? '#818cf8' : selectedFileName ? '#10b981' : '#475569'}`,
              background: isDraggingOver ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.6)',
              borderRadius: '20px',
              padding: '2.25rem 1.75rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              backdropFilter: 'blur(8px)',
              boxShadow: isDraggingOver ? '0 0 25px rgba(99, 102, 241, 0.3)' : 'none',
              marginBottom: '1.75rem'
            }}
          >
            <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '1.75rem' }}>
              ☁️
            </div>
            {selectedFileName ? (
              <div>
                <strong style={{ color: '#34d399', fontSize: '1.05rem', display: 'block', marginBottom: '0.25rem' }}>✓ Selected: {selectedFileName}</strong>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click below to run instant AI evaluation</span>
              </div>
            ) : (
              <div>
                <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                  Drag & drop your resume here, or <span style={{ color: '#818cf8', textDecoration: 'underline' }}>click to browse</span>
                </strong>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>
                  Supports PDF, DOCX, TXT (Max 10MB) • 100% Confidential
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (selectedFileName || session) navigate('/analysis');
              else triggerUpload();
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '1.15rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(79, 70, 229, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              transition: 'all 0.2s ease'
            }}
          >
            🔥 Analyze My Resume Now ➔
          </button>
        </div>

        {/* Right Column: Live Sample Dashboard Teaser Preview */}
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(16px)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a5b4fc', fontWeight: '900' }}>
              ⚡ LIVE DEMO PREVIEW
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {demoSamples.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setDemoSampleIndex(idx)}
                  style={{
                    background: demoSampleIndex === idx ? '#4f46e5' : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.25rem 0.55rem',
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Sample {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#0f172a', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: `conic-gradient(#10b981 ${currentSample.score}%, #1e293b 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', fontWeight: '900', color: '#ffffff' }}>
                {currentSample.score}%
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', margin: '0 0 0.2rem 0', color: '#ffffff' }}>{currentSample.name}</h4>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700' }}>Target: {currentSample.role}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#e2e8f0' }}>Detected Skill Gaps to Focus On:</span>
            {currentSample.missing.map((sk, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: '#f87171', fontWeight: '800' }}>
                <span>• {sk}</span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(239, 68, 68, 0.2)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>Critical</span>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/analysis')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', padding: '0.65rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer', transition: 'background 0.2s' }}>
            Explore Full Sample Report ➔
          </button>
        </div>
      </section>

      {/* ─── 3. TARGET COMPANIES BRANDING BAND ────────────────────── */}
      <section style={{ textTransform: 'uppercase', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.1em', display: 'block', marginBottom: '1.5rem' }}>
          PREPARE & BENCHMARK FOR TOP TECH COMPANIES
        </span>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.85 }}>
          {['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Meta'].map((comp, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.6rem 1.6rem', borderRadius: '12px', fontWeight: '900', color: '#334155', fontSize: '1.05rem', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', letterSpacing: '0.04em' }}>
              {comp}
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. CORE AI SUPERPOWERS (CLEAN 3x2 GRID WITH VECTOR ICONS) ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ background: 'rgba(79,70,229,0.1)', color: '#4f46e5', fontSize: '0.75rem', fontWeight: '900', padding: '0.35rem 0.9rem', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            CORE AI SUPERPOWERS
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', margin: '0.75rem 0 0.5rem 0', letterSpacing: '-0.03em' }}>
            Everything you need for 100% placement readiness
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, fontWeight: '600' }}>
            Powered by modern LLM evaluators trained on real technical placement interview rubrics.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.75rem' }}>
          {[
            { Icon: IconAts, color: '#6366f1', title: 'ATS Score Scanner', desc: 'Instant recruiter readability rating, formatting check, and keyword optimization.', route: '/analysis' },
            { Icon: IconTarget, color: '#3b82f6', title: 'Skill Gap Detector', desc: 'Pinpoint missing tech stack requirements categorized by priority levels.', route: '/analysis' },
            { Icon: IconBriefcase, color: '#10b981', title: 'Job Match Index', desc: 'Semantic alignment scoring against live job descriptions from target companies.', route: '/matcher' },
            { Icon: IconMap, color: '#8b5cf6', title: 'Personalized Roadmap', desc: 'Week-by-week technical study timetable with checkable project tasks.', route: '/roadmap' },
            { Icon: IconBot, color: '#f59e0b', title: '24/7 AI Mentor', desc: 'ChatGPT-style assistant trained to answer technical concepts and interview Q&As.', route: '/analysis' },
            { Icon: IconMic, color: '#ec4899', title: 'Mock Interview Coach', desc: 'Practice Technical, STAR Behavioral, and HR interview rounds with real-time scoring.', route: '/interview' }
          ].map((item, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(item.route)}
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
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = `0 12px 30px -5px ${item.color}25`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
              }}
            >
              <div>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <item.Icon size={26} color={item.color} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.6rem 0' }}>{item.title}</h3>
                <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: '1.55', margin: 0, fontWeight: '500' }}>{item.desc}</p>
              </div>
              <span style={{ fontSize: '0.88rem', color: item.color, fontWeight: '800', marginTop: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                Explore Feature ➔
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. PLACEMENT PROOF METRICS ─────────────────────────── */}
      <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
        {[
          { stat: '10,000+', label: 'Resumes Evaluated' },
          { stat: '89%', label: 'Placement Selection Rate' },
          { stat: '< 30s', label: 'Average Evaluation Speed' },
          { stat: '4.9 / 5', label: 'Student Satisfaction Score' }
        ].map((m, idx) => (
          <div key={idx}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#4f46e5', marginBottom: '0.35rem', letterSpacing: '-0.03em' }}>{m.stat}</div>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '700' }}>{m.label}</span>
          </div>
        ))}
      </section>

      {/* ─── 6. RECENT HISTORY (IF AVAILABLE) ────────────────────── */}
      {history && history.length > 0 && (
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0 0 1rem 0' }}>Recent Resume Scans</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.slice(0, 3).map((item, index) => (
              <div key={index} onClick={() => navigate('/analysis')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <IconAts size={22} color="#4f46e5" />
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{item.filename || 'Resume_Audit.pdf'}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Analyzed {item.uploadDate || 'Recently'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#4f46e5' }}>{item.atsScore || 87}% ATS Score</span>
                  <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: '800' }}>View Report ➔</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── 7. COMPREHENSIVE PLATFORM FOOTER ────────────────────── */}
      <footer style={{
        background: '#0f172a',
        borderRadius: '24px',
        padding: '3.5rem 3rem 2rem 3rem',
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: '900', fontSize: '1.2rem' }}>⚡</div>
              <span style={{ fontWeight: '900', fontSize: '1.35rem', color: '#ffffff' }}>PlaceAI</span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 1rem 0', color: '#94a3b8' }}>
              The modern AI placement readiness platform helping students evaluate resumes, identify skill gaps, and land tech jobs.
            </p>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>🔒 100% Confidential & Secure Evaluation</span>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '800', margin: '0 0 1rem 0' }}>Platform Features</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/analysis')}>ATS Score Evaluator</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/analysis')}>Skill Gap Detector</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/matcher')}>Job Match Index</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/roadmap')}>Learning Roadmap</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '800', margin: '0 0 1rem 0' }}>Resources & Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <span style={{ cursor: 'pointer' }}>Documentation</span>
              <span style={{ cursor: 'pointer' }}>Placement Guides</span>
              <span style={{ cursor: 'pointer' }}>API Reference</span>
              <span style={{ cursor: 'pointer' }}>Help Center</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '800', margin: '0 0 1rem 0' }}>Legal & Privacy</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
              <span style={{ cursor: 'pointer' }}>Security Standards</span>
              <span style={{ cursor: 'pointer' }}>Confidentiality Guarantee</span>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          <span>© 2026 PlaceAI Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
