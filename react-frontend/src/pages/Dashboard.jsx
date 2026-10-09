import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

// ─── Animated Circular Readiness Ring ─────────────────────────────────────────
const ReadinessRing = ({ score = 72 }) => {
  const r = 58;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#6366f1' : '#f59e0b';

  return (
    <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto' }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle
          cx="75" cy="75" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 75 75)"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 10px ${color})`,
          }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2
      }}>
        <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          / 100
        </span>
      </div>
    </div>
  );
};

// ─── Time-of-day greeting ─────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { session, updateStudentProfile } = useSession();

  const studentName = session?.identity?.name || 'Shiva';
  const targetRole = session?.identity?.targetRole || 'Software Engineer';
  const readiness = session?.scores?.readiness ?? 72;
  const resumeScore = session?.scores?.resume ?? 84;
  const interviewScore = session?.scores?.interview ?? 71;
  const skillsScore = session?.scores?.skills ?? 68;
  const jobMatchScore = session?.scores?.jobMatch ?? 82;
  const dsaScore = session?.scores?.dsa ?? 47;
  const monthlyChange = session?.scores?.monthlyChange ?? '+8%';

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1380px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* ─── HERO HEADER: "Good evening, Shiva 👋" ──────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="saas-pill">⚡ AI PLACEMENT OPERATING SYSTEM</span>
            <span className="badge badge-green">Target: {targetRole}</span>
          </div>
          <h1 className="hero-giant-title" style={{ margin: 0 }}>
            {getGreeting()}, <span className="gradient-text">{studentName}</span> 👋
          </h1>
          <p className="hero-lead-text" style={{ margin: '0.5rem 0 0 0', fontWeight: 500 }}>
            You're <strong style={{ color: 'var(--indigo-light)' }}>{readiness}% placement ready</strong>. Focus on DSA fundamentals today to break into top product companies.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/resume')}
            style={{ borderRadius: '14px', padding: '0.75rem 1.4rem' }}
          >
            📄 Resume AI ({resumeScore}/100)
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/mentor')}
            style={{ borderRadius: '14px', padding: '0.75rem 1.4rem' }}
          >
            ✦ Ask AI Mentor
          </button>
        </div>
      </div>

      {/* ─── PRIMARY COMMAND GRID: READINESS HERO + TODAY'S PRIORITY ───── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 1.1fr) minmax(340px, 1.4fr)',
        gap: '1.5rem',
      }}>
        
        {/* CARD 1: PLACEMENT READINESS SCORECARD */}
        <div className="saas-hero-card" style={{ padding: '2.2rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                PLACEMENT READINESS
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                ↑ {monthlyChange} this month
              </span>
            </div>

            {/* Centered Ring */}
            <div style={{ padding: '0.5rem 0 1.25rem' }}>
              <ReadinessRing score={readiness} />
              <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Overall benchmark across 4 hiring dimensions
                </span>
              </div>
            </div>
          </div>

          {/* 4 Pillars Underneath: Resume (84), Interview (71), Skills (68), Jobs (82) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-default)',
            paddingTop: '1.25rem',
            marginTop: '0.75rem',
            textAlign: 'center',
          }}>
            <div
              onClick={() => navigate('/resume')}
              style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '12px', background: 'var(--bg-hover)', transition: 'transform 0.2s' }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resume</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--indigo-light)' }}>{resumeScore}</div>
              <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>ATS Ready</div>
            </div>

            <div
              onClick={() => navigate('/interview')}
              style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '12px', background: 'var(--bg-hover)', transition: 'transform 0.2s' }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Interview</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f472b6' }}>{interviewScore}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>10 Mock Rds</div>
            </div>

            <div
              onClick={() => navigate('/skill-map')}
              style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '12px', background: 'var(--bg-hover)', transition: 'transform 0.2s' }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Skills</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b' }}>{skillsScore}%</div>
              <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>6 Assessed</div>
            </div>

            <div
              onClick={() => navigate('/job-matcher')}
              style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '12px', background: 'var(--bg-hover)', transition: 'transform 0.2s' }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Jobs</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>{jobMatchScore}%</div>
              <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>Amazon Match</div>
            </div>
          </div>
        </div>

        {/* CARD 2: TODAY'S FOCUS & PRIORITY */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.2rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span className="badge badge-amber" style={{ fontSize: '0.72rem', fontWeight: 900, padding: '0.3rem 0.8rem' }}>
                🎯 TODAY'S PRIORITY
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>High Impact Action</span>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.6rem 0', letterSpacing: '-0.02em' }}>
              Improve your DSA fundamentals
            </h2>

            <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>
              Your DSA readiness is currently <strong style={{ color: '#f59e0b' }}>{dsaScore}%</strong>. Top tech hiring tests (Amazon, Google, Microsoft) weigh graph traversal, BFS/DFS, and dynamic programming heavily.
            </p>

            {/* DSA Progress bar */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-default)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>DSA Readiness Progress</span>
                <span style={{ color: '#f59e0b' }}>{dsaScore}% / 100%</span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${dsaScore}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '99px', transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>Solved: 50 / 120 target</span>
                <span>Next up: Graph BFS & Matrix Traversal</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/roadmap')}
              className="btn btn-primary"
              style={{ borderRadius: '14px', padding: '0.85rem 1.8rem', fontSize: '0.95rem' }}
            >
              Start Practice →
            </button>
            <button
              onClick={() => navigate('/skill-map')}
              className="btn btn-secondary"
              style={{ borderRadius: '14px', padding: '0.85rem 1.4rem' }}
            >
              View Skill Gap Map
            </button>
          </div>
        </div>
      </div>

      {/* ─── YOUR PLACEMENT JOURNEY (INTERACTIVE WORKFLOW STEPPER) ──────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.2rem 2rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              STEP-BY-STEP ROADMAP
            </span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
              Your Placement Journey 🚀
            </h3>
          </div>
          <span className="badge badge-cyan" style={{ padding: '0.3rem 0.8rem' }}>4 of 6 Milestones Completed</span>
        </div>

        {/* Stepper Node List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
          position: 'relative',
        }}>
          {[
            { step: '01', title: 'Student Profile', status: 'done', icon: '✓', desc: 'Target: SDE-1', path: '/dashboard' },
            { step: '02', title: 'Resume AI', status: 'done', icon: '✓', desc: '84/100 ATS Score', path: '/resume' },
            { step: '03', title: 'Skill Analysis', status: 'done', icon: '✓', desc: '68% Core Ready', path: '/skill-map' },
            { step: '04', title: 'Job Matching', status: 'active', icon: '⚡', desc: '82% Amazon Match', path: '/job-matcher' },
            { step: '05', title: 'Interview AI', status: 'upcoming', icon: '🎤', desc: '71/100 STAR Score', path: '/interview' },
            { step: '06', title: 'Placement Ready', status: 'target', icon: '🎯', desc: 'Aim: 85%+ Ready', path: '/roadmap' },
          ].map((item, idx) => {
            const isDone = item.status === 'done';
            const isActive = item.status === 'active';
            return (
              <div
                key={item.step}
                onClick={() => navigate(item.path)}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1))'
                    : 'var(--bg-surface)',
                  border: `1.5px solid ${isActive ? 'var(--indigo)' : isDone ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-default)'}`,
                  borderRadius: '18px',
                  padding: '1.25rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 8px 24px rgba(99, 102, 241, 0.25)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>{item.step}</span>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: isDone ? 'rgba(16, 185, 129, 0.2)' : isActive ? 'var(--indigo)' : 'var(--bg-overlay)',
                    color: isDone ? '#10b981' : '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 900,
                  }}>
                    {item.icon}
                  </div>
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: isDone ? '#10b981' : isActive ? 'var(--indigo-light)' : 'var(--text-secondary)' }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── "EVERYTHING YOU NEED FOR PLACEMENT" — 6 LARGE COMMAND CARDS ─ */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            COMMAND CENTER CAPABILITIES
          </span>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.25rem 0 0 0', letterSpacing: '-0.02em' }}>
            Everything You Need For Placement 🌟
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
            A unified suite of AI tools engineered specifically for engineering campus placement success.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.35rem',
        }}>
          {/* Card 1: Resume AI */}
          <div
            onClick={() => navigate('/resume')}
            className="card"
            style={{ borderRadius: '22px', padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  📄
                </div>
                <span className="badge badge-indigo">84 / 100</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>Resume AI</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                ATS score analysis, keyword extraction, and measurable bullet point impact feedback.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: 'var(--indigo-light)' }}>
              <span>ATS Score: 92%</span>
              <span>Open Analyzer →</span>
            </div>
          </div>

          {/* Card 2: Job Matcher */}
          <div
            onClick={() => navigate('/job-matcher')}
            className="card"
            style={{ borderRadius: '22px', padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  🎯
                </div>
                <span className="badge badge-green">82% Match</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>Job Matcher</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Benchmark your profile against Amazon SDE-1, TCS Digital, and Accenture requirements.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#10b981' }}>
              <span>14 / 17 Skills Matched</span>
              <span>View Matches →</span>
            </div>
          </div>

          {/* Card 3: Skill Map */}
          <div
            onClick={() => navigate('/skill-map')}
            className="card"
            style={{ borderRadius: '22px', padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  🧠
                </div>
                <span className="badge badge-amber">68% Ready</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>Skill Map</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Hierarchical technical skill constellation across Backend, Frontend, and AI domains.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b' }}>
              <span>Top Gap: System Design</span>
              <span>Explore Graph →</span>
            </div>
          </div>

          {/* Card 4: Interview AI */}
          <div
            onClick={() => navigate('/interview')}
            className="card"
            style={{ borderRadius: '22px', padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(244, 114, 182, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  🎤
                </div>
                <span className="badge badge-pink">71/100 Score</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>Interview AI</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Simulate technical, HR behavioral, and project rounds with instant 5-metric scoring.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#f472b6' }}>
              <span>STAR Rubric Evaluator</span>
              <span>Start Round →</span>
            </div>
          </div>

          {/* Card 5: Roadmap */}
          <div
            onClick={() => navigate('/roadmap')}
            className="card"
            style={{ borderRadius: '22px', padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  🗺
                </div>
                <span className="badge badge-violet">Phase 2 Active</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>Roadmap</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Visual 4-phase preparation journey connecting skill gaps directly to practice tasks.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa' }}>
              <span>Phase 2: Skill Mastery</span>
              <span>View Timeline →</span>
            </div>
          </div>

          {/* Card 6: AI Mentor */}
          <div
            onClick={() => navigate('/mentor')}
            className="card"
            style={{ borderRadius: '22px', padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  🤖
                </div>
                <span className="badge badge-cyan">3 Insights</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>AI Mentor</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Context-aware placement advisor providing daily customized recommendations.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#06b6d4' }}>
              <span>Context: Shiva / SDE-1</span>
              <span>Talk to Mentor →</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
