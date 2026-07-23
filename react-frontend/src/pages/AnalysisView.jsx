import React, { useState } from 'react';
import { useSession, DEFAULT_DEMO_SESSION } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

const AnalysisView = () => {
  const { session, profile } = useSession();
  const navigate = useNavigate();
  const activeSession = session || DEFAULT_DEMO_SESSION;
  const [activeTab, setActiveTab] = useState('overview');

  // AI Chat state for Mentor tab
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! I'm your PlaceAI Mentor. Ask me anything about improving your ATS score, mastering missing skills, or preparing for interviews!", sender: 'ai' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { id: Date.now(), text: chatInput, sender: 'user' };
    setChatMessages(prev => [...prev, userMsg]);
    const inputCopy = chatInput;
    setChatInput('');

    setTimeout(() => {
      let aiReply = "To optimize your ATS score, focus on quantifiable achievements (e.g., 'Improved API latency by 40% using Redis') and include exact keyword matches for your target role.";
      if (inputCopy.toLowerCase().includes('react') || inputCopy.toLowerCase().includes('frontend')) {
        aiReply = "For Frontend roles, highlight experience with React 18, state management (Redux/Zustand), TypeScript, and Web Vitals performance tuning.";
      } else if (inputCopy.toLowerCase().includes('interview') || inputCopy.toLowerCase().includes('prep')) {
        aiReply = "Use the STAR method (Situation, Task, Action, Result) for behavioral questions. For technical rounds, practice LeetCode medium problems on Data Structures & System Design fundamentals.";
      }
      setChatMessages(prev => [...prev, { id: Date.now() + 1, text: aiReply, sender: 'ai' }]);
    }, 600);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="analysis-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* ─── TOP SUMMARY HEADER CARD ─────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '1.75rem 2.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Donut Gauge */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: `conic-gradient(#4f46e5 ${activeSession.atsScore || 84}%, #f1f5f9 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79,70,229,0.2)'
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>{activeSession.atsScore || 84}%</span>
              <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '800', marginTop: '2px' }}>ATS SCORE</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                {profile?.name || 'Shiva Reddy'}
              </h2>
              <span style={{ background: 'rgba(79,70,229,0.1)', color: '#4f46e5', fontSize: '0.72rem', fontWeight: '800', padding: '0.25rem 0.75rem', borderRadius: '999px', letterSpacing: '0.04em' }}>
                {profile?.preferredRole || 'Full Stack Software Engineer'}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, fontWeight: '600' }}>
              📄 Active File: <strong style={{ color: '#0f172a' }}>{activeSession.resumeName || 'Candidate_Resume.pdf'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              borderRadius: '12px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            ☁️ Upload New Resume
          </button>

          <button 
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.65rem 1.4rem',
              fontSize: '0.85rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            📥 Download Report
          </button>
        </div>
      </div>

      {/* ─── TABS NAVIGATION BAR ─────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '0.4rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        {[
          { id: 'overview', label: '📊 Overview', desc: 'Overall Scorecard & Fit' },
          { id: 'skills', label: '🎯 Skills & Gaps', desc: 'Competency Breakdown' },
          { id: 'jobs', label: '💼 Job Matches', desc: 'Company Compatibility' },
          { id: 'roadmap', label: '🗺️ Roadmap', desc: '4-Week Curriculum' },
          { id: 'mentor', label: '🤖 AI Mentor', desc: 'Placement Q&A Assistant' },
          { id: 'interview', label: '🎤 Mock Interview', desc: 'Practice Rounds' }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: isSelected ? '#4f46e5' : 'transparent',
                color: isSelected ? '#ffffff' : '#64748b',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.88rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.65rem', opacity: isSelected ? 0.9 : 0.7, fontWeight: '600' }}>{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB CONTENT PANELS ─────────────────────────────────────── */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Sub-scores Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {[
              { label: 'Technical Skills', pct: 88, color: '#8b5cf6', icon: '🧠' },
              { label: 'Project Impact', pct: 75, color: '#3b82f6', icon: '⚡' },
              { label: 'Work Experience', pct: 65, color: '#06b6d4', icon: '💼' },
              { label: 'Communication', pct: 90, color: '#ec4899', icon: '💬' }
            ].map((sub, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.35rem 1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b' }}>{sub.label}</span>
                  <span style={{ fontSize: '1.2rem' }}>{sub.icon}</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>{sub.pct}%</div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${sub.pct}%`, height: '100%', background: sub.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Strong vs Weak Areas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Strong Areas */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Strong Competencies</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Frontend Architecture (React 18, State Management, Custom Hooks)',
                  'RESTful API Design with FastAPI & Node.js',
                  'Version Control & CI/CD Fundamentals (Git, GitHub Actions)',
                  'SQL Database Schema & Relational Modeling'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#047857' }}>
                    <span>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Key Improvement Areas</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'System Design & Distributed Scalability (Load Balancers, Sharding)',
                  'Containerization (Docker Compose & Kubernetes Deployments)',
                  'Advanced PostgreSQL Query Performance & B-Tree Indexing',
                  'In-Memory Caching Strategies (Redis Cache-Aside Pattern)'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#b91c1c' }}>
                    <span>!</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SKILLS TAB */}
      {activeTab === 'skills' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Competency & Skill Gap Analysis</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, fontWeight: '600' }}>Extracted candidate skills benchmarked against target role expectations.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { name: 'React & Frontend Engineering', pct: 92, color: '#4f46e5', status: 'Proficient' },
              { name: 'Node.js & Express APIs', pct: 85, color: '#3b82f6', status: 'Strong' },
              { name: 'Python & FastAPI Backend', pct: 78, color: '#10b981', status: 'Good' },
              { name: 'SQL & Database Design', pct: 60, color: '#f59e0b', status: 'Intermediate' },
              { name: 'System Design & Scalability', pct: 35, color: '#ef4444', status: 'Critical Gap' },
              { name: 'Docker & DevOps Pipelines', pct: 40, color: '#ef4444', status: 'High Priority Gap' }
            ].map((skill, idx) => (
              <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{skill.name}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: skill.color }}>{skill.status} ({skill.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${skill.pct}%`, height: '100%', background: skill.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. JOB MATCHES TAB */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            {
              company: 'Google Cloud Platform',
              role: 'Frontend UI Engineer',
              match: 85,
              matching: ['React', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS', 'REST APIs'],
              missing: ['TypeScript Strict Mode', 'Vite Performance Tuning'],
              logo: '🌐'
            },
            {
              company: 'Amazon Web Services',
              role: 'Full Stack Software Engineer',
              match: 79,
              matching: ['Python', 'FastAPI', 'Node.js', 'SQL', 'Git'],
              missing: ['Docker & Kubernetes', 'System Design', 'AWS Lambda'],
              logo: '📦'
            },
            {
              company: 'Microsoft Azure',
              role: 'Backend API Developer',
              match: 74,
              matching: ['Python', 'FastAPI', 'SQL', 'REST APIs'],
              missing: ['PostgreSQL Query Tuning', 'Redis Caching'],
              logo: '⚡'
            }
          ].map((job, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem 1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{job.logo}</div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.2rem 0' }}>{job.role}</h4>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>{job.company}</span>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
                    {job.matching.map((m, i) => (
                      <span key={i} style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>✓ {m}</span>
                    ))}
                    {job.missing.map((m, i) => (
                      <span key={i} style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>! Missing: {m}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '900', color: getScoreColor(job.match) }}>{job.match}%</div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800' }}>Match Fit</span>
                </div>
                <button style={{ background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.7rem 1.4rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>
                  Apply Now ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. ROADMAP TAB */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { week: 'Week 1', title: 'System Design & Scalability', focus: 'Load balancers, caching, URL shortener TinyURL architecture.', icon: '🗺️' },
            { week: 'Week 2', title: 'DevOps & Docker Containers', focus: 'Dockerfiles, multi-stage builds, Docker Compose stack.', icon: '📦' },
            { week: 'Week 3', title: 'Advanced Postgres Query Tuning', focus: 'B-Tree indexing, execution plans, ORM performance.', icon: '⚡' },
            { week: 'Week 4', title: 'AI Mock Interviews & Portfolio', focus: 'STAR behavioral answers, technical coding rounds.', icon: '🎤' }
          ].map((w, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.5rem 1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ background: 'rgba(79,70,229,0.1)', color: '#4f46e5', fontSize: '0.72rem', fontWeight: '900', padding: '0.25rem 0.65rem', borderRadius: '999px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {w.week}
                </span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0.75rem 0 0.35rem 0' }}>{w.title}</h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{w.focus}</p>
              </div>
              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800' }}>✓ 3 Tasks Assigned</span>
                <button style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>View Details ➔</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. AI MENTOR TAB */}
      {activeTab === 'mentor' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', height: '520px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🤖</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>PlaceAI Mentor Chat</h3>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700' }}>● Online 24/7 Placement Q&A Assistant</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.5rem' }}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                background: msg.sender === 'user' ? '#4f46e5' : '#f8fafc',
                color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                padding: '0.85rem 1.15rem',
                borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                maxWidth: '75%',
                fontSize: '0.88rem',
                lineHeight: 1.45,
                fontWeight: '600'
              }}>
                {msg.text}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <input
              type="text"
              placeholder="Ask PlaceAI Mentor anything... (e.g. How do I improve ATS?)"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.88rem', color: '#0f172a', outline: 'none' }}
            />
            <button onClick={handleSendChat} style={{ background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0 1.35rem', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem' }}>
              Send ➔
            </button>
          </div>
        </div>
      )}

      {/* 6. MOCK INTERVIEW TAB */}
      {activeTab === 'interview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { title: 'Technical Coding Round', icon: '💻', desc: 'Data Structures, React state management, and API design questions.', color: '#4f46e5' },
            { title: 'Behavioral STAR Round', icon: '🗣️', desc: 'Leadership, teamwork, crisis resolution, and communication scenarios.', color: '#3b82f6' },
            { title: 'HR & Cultural Fit Round', icon: '🤝', desc: 'Salary negotiations, career goals, company values, and role expectation questions.', color: '#10b981' }
          ].map((round, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${round.color}15`, color: round.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>{round.icon}</div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>{round.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{round.desc}</p>
              </div>
              <button 
                onClick={() => navigate('/assistant')}
                style={{
                  marginTop: '1.5rem',
                  background: round.color,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${round.color}40`
                }}
              >
                Start Practice Session ➔
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AnalysisView;
