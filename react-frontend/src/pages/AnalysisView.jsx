import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

const AnalysisView = () => {
  const { session, profile, resetSession } = useSession();
  const navigate = useNavigate();
  
  const atsResult = session?.atsResult || null;
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

  const bd = atsResult?.breakdown || {
    readability: 0,
    sections: 0,
    contact: 0,
    skills: 0,
    experience: 0,
    achievements: 0,
    education: 0,
    formatting: 0
  };

  // Dynamic Sub-score percentages calculated directly from atsResult
  const technicalSkillsPct = atsResult ? Math.round((bd.skills / 15) * 100) : 0;
  const projectImpactPct = atsResult ? Math.round((bd.achievements / 10) * 100) : 0;
  const workExperiencePct = atsResult ? Math.round((bd.experience / 15) * 100) : 0;
  const formattingPct = atsResult ? Math.round((bd.formatting / 15) * 100) : 0;

  const currentScore = atsResult?.resumeAtsScore ?? 0;

  return (
    <div className="analysis-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '140px' }}>
      
      {/* ─── TOP SUMMARY HEADER CARD ─────────────────────────────────── */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '1.75rem 2.25rem',
        boxShadow: 'var(--shadow-lg)',
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
            background: `conic-gradient(var(--accent-primary) ${currentScore}%, #f1f5f9 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79,70,229,0.2)'
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'var(--card-bg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                {atsResult ? `${currentScore}%` : '0%'}
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '800', marginTop: '2px' }}>ATS SCORE</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                {profile?.identity?.name || profile?.name || 'Candidate'}
              </h2>
              <span style={{ background: 'rgba(79,70,229,0.1)', color: 'var(--accent-primary)', fontSize: '0.72rem', fontWeight: '800', padding: '0.25rem 0.75rem', borderRadius: '999px', letterSpacing: '0.04em' }}>
                {profile?.identity?.targetRole || 'Full Stack Software Engineer'}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
              📄 Active File: <strong style={{ color: 'var(--text-primary)' }}>{atsResult?.fileName || 'No Resume Uploaded (Reset State)'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => {
              resetSession();
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              borderRadius: '12px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            🔄 Reset Session
          </button>

          <button 
            onClick={() => {
              navigate('/resume');
            }}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
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
            onClick={() => navigate('/resume')}
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), #6366f1)',
              color: 'var(--card-bg)',
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
            ⚡ Open ATS Analyzer
          </button>
        </div>
      </div>

      {/* ─── UNANALYZED WARNING CALLOUT ─────────────────────────────── */}
      {!atsResult && (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.25rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.2rem 0' }}>
              Session Reset — No Active Resume Analyzed
            </h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              All scores are currently set to 0. Upload a resume file to generate real-time ATS sub-scores and skill gap analytics.
            </span>
          </div>
          <button onClick={() => navigate('/resume')} style={{ background: 'var(--accent-primary)', color: 'var(--card-bg)', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}>
            ☁️ Upload Resume Now →
          </button>
        </div>
      )}

      {/* ─── TABS NAVIGATION BAR ─────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
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
                background: isSelected ? 'var(--accent-primary)' : 'transparent',
                color: isSelected ? 'var(--card-bg)' : 'var(--text-secondary)',
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
              { label: 'Technical Skills Density', pct: technicalSkillsPct, color: '#8b5cf6', icon: '🧠' },
              { label: 'Quantified Impact Metrics', pct: projectImpactPct, color: '#3b82f6', icon: '⚡' },
              { label: 'Work & Project Experience', pct: workExperiencePct, color: '#06b6d4', icon: '💼' },
              { label: 'Formatting & Readability', pct: formattingPct, color: '#ec4899', icon: '💬' }
            ].map((sub, idx) => (
              <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.35rem 1.5rem', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{sub.label}</span>
                  <span style={{ fontSize: '1.2rem' }}>{sub.icon}</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {atsResult ? `${sub.pct}%` : '0%'}
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${atsResult ? sub.pct : 0}%`, height: '100%', background: sub.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Strong vs Weak Areas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Strong Areas */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>Detected Competencies</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {atsResult?.detectedSkills?.length ? (
                  atsResult.detectedSkills.slice(0, 5).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#047857' }}>
                      <span>✓</span> {item}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    No resume uploaded yet. Upload a file to detect strong skills.
                  </div>
                )}
              </div>
            </div>

            {/* Weak Areas */}
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>Key Audit Warnings & Gaps</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {atsResult?.warnings?.length ? (
                  atsResult.warnings.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#b91c1c' }}>
                      <span>!</span> {item}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    No resume uploaded yet. Upload a file to inspect warnings.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SKILLS TAB */}
      {activeTab === 'skills' && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>Competency & Skill Gap Analysis</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>Extracted candidate skills benchmarked against target role expectations.</p>
          </div>

          {atsResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(atsResult.detectedSkills || []).map((skill, idx) => (
                <div key={idx} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{skill}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#10b981' }}>Detected • Proficient</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '90%', height: '100%', background: 'var(--accent-primary)', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Upload your resume in the Resume Analyzer to inspect skill extraction.
            </div>
          )}
        </div>
      )}

      {/* 3. JOB MATCHES TAB */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            {
              company: 'Google Cloud Platform',
              role: 'Frontend UI Engineer',
              requiredSkills: ['React', 'JavaScript', 'HTML5/CSS3', 'REST APIs'],
              logo: '🌐'
            },
            {
              company: 'Amazon Web Services',
              role: 'Full Stack Software Engineer',
              requiredSkills: ['Python', 'FastAPI', 'Node.js', 'SQL', 'Git', 'Docker'],
              logo: '📦'
            }
          ].map((job, idx) => {
            const candidateSkills = (atsResult?.detectedSkills || []).map(s => s.toLowerCase());
            const matched = job.requiredSkills.filter(req => candidateSkills.some(cs => cs.includes(req.toLowerCase())));
            const matchScore = atsResult ? Math.min(95, Math.max(45, Math.round((matched.length / job.requiredSkills.length) * 100))) : 0;

            return (
              <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.5rem 1.75rem', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{job.logo}</div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.2rem 0' }}>{job.role}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '700' }}>{job.company}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: getScoreColor(matchScore) }}>
                      {atsResult ? `${matchScore}%` : '0%'}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '800' }}>Match Fit</span>
                  </div>
                  <button onClick={() => navigate('/job-matcher')} style={{ background: 'var(--accent-primary)', color: 'var(--card-bg)', border: 'none', borderRadius: '10px', padding: '0.7rem 1.4rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}>
                    View Matcher ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. ROADMAP TAB */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { week: 'Phase 1', title: 'Resume & Baseline Audit', focus: 'Upload resume and evaluate 8-category ATS score.', icon: '🗺️' },
            { week: 'Phase 2', title: 'Skill Gap & Technical Mastery', focus: 'Focus on missing skills: System Design & Kubernetes.', icon: '📦' }
          ].map((w, idx) => (
            <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '18px', padding: '1.5rem 1.75rem', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ background: 'rgba(79,70,229,0.1)', color: 'var(--accent-primary)', fontSize: '0.72rem', fontWeight: '900', padding: '0.25rem 0.65rem', borderRadius: '999px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {w.week}
                </span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0.75rem 0 0.35rem 0' }}>{w.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{w.focus}</p>
              </div>
              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => navigate('/learning-roadmap')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Go to Roadmap ➔</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. AI MENTOR TAB */}
      {activeTab === 'mentor' && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)', height: '520px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🤖</span>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>PlaceAI Mentor Chat</h3>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700' }}>● Online 24/7 Placement Q&A Assistant</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: '0.5rem' }}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                background: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-primary)',
                color: msg.sender === 'user' ? 'var(--card-bg)' : 'var(--text-primary)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
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

          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <input
              type="text"
              placeholder="Ask PlaceAI Mentor anything... (e.g. How do I improve ATS?)"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              style={{ flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.88rem', color: 'var(--text-primary)', outline: 'none' }}
            />
            <button onClick={handleSendChat} style={{ background: 'var(--accent-primary)', color: 'var(--card-bg)', border: 'none', borderRadius: '12px', padding: '0 1.35rem', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem' }}>
              Send ➔
            </button>
          </div>
        </div>
      )}

      {/* 6. MOCK INTERVIEW TAB */}
      {activeTab === 'interview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { title: 'Technical Coding Round', icon: '💻', desc: 'Data Structures, React state management, and API design questions.', color: 'var(--accent-primary)' },
            { title: 'Behavioral STAR Round', icon: '🗣️', desc: 'Leadership, teamwork, crisis resolution, and communication scenarios.', color: '#3b82f6' },
            { title: 'HR & Cultural Fit Round', icon: '🤝', desc: 'Salary negotiations, career goals, company values, and role expectation questions.', color: '#10b981' }
          ].map((round, idx) => (
            <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${round.color}15`, color: round.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>{round.icon}</div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{round.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{round.desc}</p>
              </div>
              <button 
                onClick={() => navigate('/assistant')}
                style={{
                  marginTop: '1.5rem',
                  background: round.color,
                  color: 'var(--card-bg)',
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
