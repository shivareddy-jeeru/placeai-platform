import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const ROADMAP_NODES = [
  {
    id: 'python',
    title: 'Python Mastery',
    status: 'completed',
    badge: '100%',
    time: '2 Weeks',
    topics: ['Data structures (dicts, sets, lists)', 'AsyncIO & concurrency', 'OOP principles & decorators', 'Pytest unit testing'],
    resources: ['Official Python Documentation', 'RealPython AsyncIO Guide', 'Fluent Python Chapter 7-14'],
    practice: ['15 Advanced Python algorithmic problems', 'Build asynchronous REST service'],
    progress: 100,
  },
  {
    id: 'git',
    title: 'Git & GitHub',
    status: 'completed',
    badge: '100%',
    time: '1 Week',
    topics: ['Branching workflows (Git Flow)', 'Interactive rebasing & merge conflicts', 'GitHub Actions CI/CD pipelines', 'Pull request code reviews'],
    resources: ['Pro Git Book', 'GitHub Skills Interactive Lab'],
    practice: ['Configured GitHub actions for PlaceAI repository', 'Resolved 3 merge conflicts'],
    progress: 100,
  },
  {
    id: 'sql',
    title: 'SQL & Database Optimization',
    status: 'completed',
    badge: '100%',
    time: '2 Weeks',
    topics: ['PostgreSQL indexing (B-Tree, GIN)', 'EXPLAIN ANALYZE query profiling', 'ACID guarantees & isolation levels', 'Normalization & schema design'],
    resources: ['Use The Index, Luke (SQL Indexing Guide)', 'PostgreSQL Performance Tuning Manual'],
    practice: ['Optimized placement query latency by 40%', 'Solved 25 LeetCode Database problems'],
    progress: 100,
  },
  {
    id: 'dsa',
    title: 'DSA Fundamentals (Active Focus)',
    status: 'in-progress',
    badge: '47%',
    time: '3 Weeks (Current)',
    topics: ['Graph traversal: BFS & DFS', 'Binary Search Trees & Treemaps', 'Dynamic Programming (1D & 2D)', 'Heaps & Priority Queues'],
    resources: ['NeetCode 150 Core List', 'Striver SDE Sheet — Graph Section', 'MIT 6.006 Introduction to Algorithms'],
    practice: ['Solved 50 / 120 target LeetCode problems', 'Complete next 5 Graph BFS problems today'],
    progress: 47,
  },
  {
    id: 'system-design',
    title: 'System Design & Scalability',
    status: 'upcoming',
    badge: 'Upcoming',
    time: '2 Weeks',
    topics: ['Distributed caching (Redis Cache-Aside)', 'Load balancing (Nginx, Round Robin, Least Connections)', 'Horizontal vs Vertical scaling', 'Rate limiting & API gateways'],
    resources: ['Designing Data-Intensive Applications (Kleppmann)', 'ByteByteGo System Design Primer'],
    practice: ['Design a URL Shortener (TinyURL)', 'Design a Rate Limiter for PlaceAI API'],
    progress: 15,
  },
  {
    id: 'cloud',
    title: 'Cloud & Containerization',
    status: 'upcoming',
    badge: 'Upcoming',
    time: '2 Weeks',
    topics: ['Docker multi-stage builds', 'AWS ECS & Fargate deployment', 'S3 asset storage & CDN', 'Environment secret management'],
    resources: ['Docker Mastery Bootcamp', 'AWS Free Tier Hands-on Workshops'],
    practice: ['Dockerize full stack application', 'Deploy to cloud with automated health checks'],
    progress: 10,
  },
  {
    id: 'interview',
    title: 'Mock Interviews & Behavioral STAR',
    status: 'upcoming',
    badge: 'Upcoming',
    time: '1 Week',
    topics: ['Amazon 16 Leadership Principles', 'STAR communication technique', 'Live technical coding under pressure', 'System design whiteboard communication'],
    resources: ['Cracking the Coding Interview Behavioral Guide', 'PlaceAI AI Mock Interview Coach'],
    practice: ['Complete 5 AI mock interviews', 'Review and eliminate filler words in speech'],
    progress: 25,
  },
  {
    id: 'ready',
    title: 'Placement Ready 🎯',
    status: 'target',
    badge: 'Goal: 85%+',
    time: 'Final Milestone',
    topics: ['Campus drive applications', 'On-campus technical round 1 & 2', 'Managerial / HR discussion', 'Offer negotiation'],
    resources: ['PlaceAI Company Hub Dossiers', 'Alumni placement archives'],
    practice: ['Attend campus drives with verified 84+ ATS resume & 80+ readiness'],
    progress: 0,
  },
];

export default function LearningRoadmap() {
  const navigate = useNavigate();
  const { session, updateStudentProfile } = useSession();
  const [selectedNode, setSelectedNode] = useState(ROADMAP_NODES[3]); // Default to DSA
  const [completedTasks, setCompletedTasks] = useState({});

  const handleSetActivePhase = (nodeTitle, phaseLabel) => {
    updateStudentProfile({
      progress: { currentPhase: phaseLabel },
      message: `Roadmap focus updated to ${phaseLabel} (${nodeTitle})! 🗺️`
    });
  };

  const handleToggleTask = (taskText) => {
    const isNowDone = !completedTasks[taskText];
    setCompletedTasks(prev => ({ ...prev, [taskText]: isNowDone }));
    
    // Increment or decrement skills score dynamically
    const currentSkills = session?.scores?.skills ?? 68;
    const nextSkills = isNowDone ? Math.min(100, currentSkills + 3) : Math.max(50, currentSkills - 3);
    
    updateStudentProfile({
      scores: { skills: nextSkills },
      message: isNowDone 
        ? `Task completed! Core skill readiness boosted to ${nextSkills}%. 🚀` 
        : `Task unchecked. Skill readiness updated to ${nextSkills}%.`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1380px', margin: '0 auto', paddingBottom: '6rem' }}>
      
      {/* ─── HERO HEADER ─────────────────────────────────────────────── */}
      <div className="saas-hero-card" style={{ padding: '2.8rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '780px' }}>
            <span className="saas-pill" style={{ marginBottom: '1rem' }}>
              VISUAL CAREER PATHWAY
            </span>
            <h1 className="hero-giant-title" style={{ margin: '0.4rem 0 0.8rem 0' }}>
              Software Engineer Roadmap 🗺️
            </h1>
            <p className="hero-lead-text" style={{ margin: 0 }}>
              A dynamic journey connecting your extracted resume skill gaps directly to curated topics, resources, and practice milestones.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.6rem', borderRadius: '18px', border: '1px solid var(--border-default)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Phase</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--indigo-light)' }}>DSA & System Design</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>3 of 8 Nodes Mastered</div>
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN WORKFLOW: VISUAL JOURNEY PATH + DETAIL DRAWER ──── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.3fr)',
        gap: '2rem',
        alignItems: 'flex-start',
      }}>
        
        {/* LEFT COLUMN: THE VISUAL JOURNEY TIMELINE NODES */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              PROGRESSION STATIONS
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
              Interactive Milestone Path
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative' }}>
            {ROADMAP_NODES.map((node, idx) => {
              const isSelected = selectedNode?.id === node.id;
              const isDone = node.status === 'completed';
              const isInProgress = node.status === 'in-progress';
              const isTarget = node.status === 'target';

              return (
                <div key={node.id} style={{ position: 'relative' }}>
                  {/* Stem line between nodes */}
                  {idx < ROADMAP_NODES.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '21px',
                      top: '42px',
                      bottom: '-12px',
                      width: '2.5px',
                      background: isDone ? '#10b981' : isInProgress ? 'var(--indigo)' : 'var(--border-default)',
                      zIndex: 1,
                    }} />
                  )}

                  {/* Node Row Card */}
                  <div
                    onClick={() => setSelectedNode(node)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.9rem 1.1rem',
                      borderRadius: '16px',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(6, 182, 212, 0.1))'
                        : 'var(--bg-surface)',
                      border: `1.5px solid ${isSelected ? 'var(--indigo)' : isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {/* Node status bubble */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isDone
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : isInProgress
                        ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                        : isTarget
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'var(--bg-elevated)',
                      border: `2px solid ${isDone ? '#10b981' : isInProgress ? '#f59e0b' : 'var(--border-default)'}`,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      flexShrink: 0,
                      boxShadow: isInProgress ? '0 0 12px rgba(245, 158, 11, 0.5)' : 'none',
                    }}>
                      {isDone ? '✓' : isInProgress ? '◉' : isTarget ? '🎯' : '○'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {node.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isDone ? '#10b981' : isInProgress ? '#f59e0b' : 'var(--text-muted)' }}>
                        Est. Time: {node.time}
                      </div>
                    </div>

                    <span className={`badge ${isDone ? 'badge-green' : isInProgress ? 'badge-amber' : 'badge-gray'}`} style={{ fontSize: '0.68rem' }}>
                      {node.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EXPANDED NODE DETAILS (TOPICS, RESOURCES, PRACTICE, ESTIMATED TIME) */}
        {selectedNode && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-accent)',
            borderRadius: '24px',
            padding: '2.5rem 2.2rem',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            position: 'sticky',
            top: '20px',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className={`badge ${selectedNode.status === 'completed' ? 'badge-green' : selectedNode.status === 'in-progress' ? 'badge-amber' : 'badge-indigo'}`}>
                  {selectedNode.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  ⏱ Estimated Time: {selectedNode.time}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedNode.title}
                </h2>
                <button
                  onClick={() => handleSetActivePhase(selectedNode.title, `Phase ${selectedNode.id === 'python' ? '1' : selectedNode.id === 'git' || selectedNode.id === 'sql' || selectedNode.id === 'dsa' ? '2' : selectedNode.id === 'system-design' || selectedNode.id === 'cloud' ? '3' : '4'}`)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid var(--indigo)',
                    color: 'var(--indigo-light)',
                    borderRadius: '10px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Make this your active roadmap phase"
                >
                  🎯 Set Active Focus Phase
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Station Completion</span>
                  <span style={{ color: 'var(--indigo-light)' }}>{selectedNode.progress}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${selectedNode.progress}%`, height: '100%', background: selectedNode.status === 'completed' ? '#10b981' : 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            </div>

            {/* Topics */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
                📚 Core Topics To Cover
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedNode.topics.map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <span style={{ color: 'var(--indigo-light)' }}>•</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
                🔗 Recommended Curated Resources
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedNode.resources.map(r => (
                  <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--indigo-light)', fontWeight: 700 }}>
                    <span>📖</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
                💻 Practice Challenges & Tasks (Click to Complete)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {selectedNode.practice.map(p => {
                  const isChecked = !!completedTasks[p];
                  return (
                    <div
                      key={p}
                      onClick={() => handleToggleTask(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.88rem',
                        color: isChecked ? '#10b981' : 'var(--text-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '10px',
                        background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-elevated)',
                        border: `1px solid ${isChecked ? '#10b981' : 'var(--border-subtle)'}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', accentColor: '#10b981' }}
                      />
                      <span style={{ textDecoration: isChecked ? 'line-through' : 'none', flex: 1 }}>{p}</span>
                      {isChecked && <span style={{ fontSize: '0.72rem', color: '#10b981' }}>+3% Skill Ready</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/interview')}
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '14px', padding: '0.85rem' }}
              >
                Practice Interview Round →
              </button>
              <button
                onClick={() => navigate('/mentor')}
                className="btn btn-secondary"
                style={{ borderRadius: '14px', padding: '0.85rem 1.25rem' }}
              >
                Ask Mentor
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
