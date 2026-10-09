import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const SKILL_DETAILS = {
  'Python': { domain: 'Backend', level: 90, status: 'Mastered', desc: 'AsyncIO, OOP, type hints, pytest & memory management', practice: 'Solved 45 problems' },
  'SQL': { domain: 'Backend', level: 84, status: 'Strong', desc: 'Indexing, query optimization, EXPLAIN ANALYZE, ACID transactions', practice: 'Solved 28 queries' },
  'React': { domain: 'Frontend', level: 81, status: 'Strong', desc: 'Hooks, virtual DOM, component memoization, state management', practice: 'Built 3 apps' },
  'Java': { domain: 'Backend', level: 72, status: 'Proficient', desc: 'Core Java, collections framework, multi-threading basics', practice: 'Solved 35 problems' },
  'DSA': { domain: 'Core CS', level: 47, status: 'Needs Practice', desc: 'Graphs, BFS/DFS, binary trees, dynamic programming', practice: '50/120 solved' },
  'System Design': { domain: 'Architecture', level: 42, status: 'Needs Attention', desc: 'Distributed caching (Redis), load balancing, sharding', practice: '2 scenarios studied' },
  'FastAPI': { domain: 'Backend', level: 88, status: 'Strong', desc: 'Pydantic schemas, dependency injection, async endpoints', practice: 'Production APIs built' },
  'Gemini / AI': { domain: 'AI & ML', level: 65, status: 'Developing', desc: 'Prompt engineering, RAG pipelines, vector embeddings', practice: 'PlaceAI Mentor integration' },
  'Cloud / AWS': { domain: 'Cloud & DevOps', level: 50, status: 'Needs Attention', desc: 'ECS, S3, Docker containers, IAM permissions', practice: '1 container deployed' },
};

export default function SkillMap() {
  const navigate = useNavigate();
  const { session, updateStudentProfile } = useSession();
  const [selectedSkill, setSelectedSkill] = useState(null);

  const skillsList = [
    { name: 'Python', level: 90, color: '#10b981' },
    { name: 'SQL', level: 84, color: '#10b981' },
    { name: 'React', level: 81, color: '#10b981' },
    { name: 'Java', level: 72, color: '#3b82f6' },
    { name: 'DSA', level: 47, color: '#f59e0b', warning: true },
    { name: 'System Design', level: 42, color: '#ef4444', danger: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ─── VISUAL HIERARCHY TREE (SOFTWARE ENGINEER DOMAIN BREAKDOWN) ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Root Node */}
        <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            color: '#ffffff',
            padding: '0.8rem 2.2rem',
            borderRadius: '999px',
            fontSize: '1.05rem',
            fontWeight: 900,
            letterSpacing: '0.04em',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
          }}>
            SOFTWARE ENGINEER
          </div>
        </div>

        {/* Tree SVG Connectors */}
        <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
          <svg viewBox="0 0 800 60" style={{ width: '100%', height: '50px' }}>
            {/* Center stem down */}
            <line x1="400" y1="0" x2="400" y2="25" stroke="var(--border-accent)" strokeWidth="2.5" />
            {/* Horizontal branch */}
            <line x1="130" y1="25" x2="670" y2="25" stroke="var(--border-accent)" strokeWidth="2.5" />
            {/* Left drop */}
            <line x1="130" y1="25" x2="130" y2="55" stroke="var(--border-accent)" strokeWidth="2.5" />
            {/* Middle drop */}
            <line x1="400" y1="25" x2="400" y2="55" stroke="var(--border-accent)" strokeWidth="2.5" />
            {/* Right drop */}
            <line x1="670" y1="25" x2="670" y2="55" stroke="var(--border-accent)" strokeWidth="2.5" />
          </svg>
        </div>

        {/* 3 Domain Columns: Backend | Frontend | AI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          maxWidth: '920px',
          margin: '0 auto',
        }}>
          {/* Domain 1: Backend */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1.5px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '1.5rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ⚙️ Backend
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {['FastAPI', 'Node.js', 'REST APIs', 'PostgreSQL'].map(sub => (
                <div
                  key={sub}
                  onClick={() => setSelectedSkill(SKILL_DETAILS[sub] || { domain: 'Backend', level: 82, status: 'Proficient', desc: sub })}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {sub}
                </div>
              ))}
            </div>
          </div>

          {/* Domain 2: Frontend */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1.5px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '20px',
            padding: '1.5rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🎨 Frontend
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {['React', 'JavaScript', 'CSS & Flexbox', 'Vite'].map(sub => (
                <div
                  key={sub}
                  onClick={() => setSelectedSkill(SKILL_DETAILS[sub] || { domain: 'Frontend', level: 80, status: 'Proficient', desc: sub })}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {sub}
                </div>
              ))}
            </div>
          </div>

          {/* Domain 3: AI & Cloud */}
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1.5px solid rgba(244, 114, 182, 0.3)',
            borderRadius: '20px',
            padding: '1.5rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--pink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🤖 AI & Cloud
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {['Gemini / LLMs', 'Machine Learning', 'RAG Pipelines', 'Docker'].map(sub => (
                <div
                  key={sub}
                  onClick={() => setSelectedSkill(SKILL_DETAILS[sub] || { domain: 'AI & Cloud', level: 68, status: 'Developing', desc: sub })}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {sub}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── YOUR LEVEL (INTERACTIVE PROGRESS BARS) ───────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '24px',
        padding: '2.2rem 2rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ASSESSED PROFICIENCY
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
              YOUR LEVEL 📊
            </h3>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Click any skill to view roadmap details</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {skillsList.map(s => (
            <div
              key={s.name}
              onClick={() => setSelectedSkill(SKILL_DETAILS[s.name] || { name: s.name, level: s.level, status: s.level > 70 ? 'Proficient' : 'Needs Practice' })}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '1.1rem 1.4rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {s.name} {s.warning ? '⚠️' : s.danger ? '🔴' : '✓'}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: s.color }}>
                  {s.level}%
                </span>
              </div>
              <div style={{ height: '9px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${s.level}%`,
                    height: '100%',
                    background: s.color,
                    borderRadius: '99px',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SKILL GAPS PRIORITY CARDS ─────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '24px',
        padding: '2.2rem 2rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            CRITICAL PLACEMENT BOTTLENECKS
          </span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
            Skill Gaps Priority 🎯
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
        }}>
          {/* Priority 1 */}
          <div
            onClick={() => navigate('/roadmap')}
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '20px',
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'transform 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-red">Priority 1 🔴</span>
                <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 800 }}>42% Level</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                System Design
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Caching (Redis), load balancing, and microservices architecture. Crucial for Amazon & Google rounds.
              </p>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ef4444' }}>
              Open System Design Roadmap →
            </div>
          </div>

          {/* Priority 2 */}
          <div
            onClick={() => navigate('/roadmap')}
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '20px',
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'transform 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-amber">Priority 2 🟠</span>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800 }}>47% Level</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                DSA Fundamentals
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Master Graph traversal (BFS/DFS) and Binary Search Trees. Solve 30 target medium problems.
              </p>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b' }}>
              Practice DSA Tasks →
            </div>
          </div>

          {/* Priority 3 */}
          <div
            onClick={() => navigate('/roadmap')}
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid rgba(234, 179, 8, 0.4)',
              borderRadius: '20px',
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem',
              transition: 'transform 0.2s',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-amber" style={{ color: '#eab308' }}>Priority 3 🟡</span>
                <span style={{ fontSize: '0.8rem', color: '#eab308', fontWeight: 800 }}>50% Level</span>
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
                Cloud & DevOps
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Docker multi-stage builds and AWS deployment. Strengthens project bullet points immediately.
              </p>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#eab308' }}>
              Open Cloud Guide →
            </div>
          </div>
        </div>
      </div>

      {/* ─── SKILL DETAIL MODAL ────────────────────────────────────────── */}
      {selectedSkill && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 8, 14, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--indigo)',
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '2.2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-indigo">{selectedSkill.domain || 'Skill Deep Dive'}</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
                  {selectedSkill.name || 'Skill Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Proficiency Level</span>
                <span style={{ color: 'var(--indigo-light)' }}>{selectedSkill.level}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${selectedSkill.level}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: '99px' }} />
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-default)' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>Focus Topics:</strong>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>
                {selectedSkill.desc || 'Core domain competencies required for campus hiring.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const currentSkills = session?.scores?.skills ?? 68;
                  const newSkills = Math.min(100, currentSkills + 5);
                  updateStudentProfile({
                    scores: { skills: newSkills },
                    message: `Verified proficiency in ${selectedSkill.name}! Core skill readiness boosted to ${newSkills}%. 🚀`
                  });
                  setSelectedSkill(null);
                }}
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
              >
                ✓ Mark Verified (+5% Readiness)
              </button>
              <button
                onClick={() => { setSelectedSkill(null); navigate('/roadmap'); }}
                className="btn btn-secondary"
                style={{ borderRadius: '12px' }}
              >
                Roadmap →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
