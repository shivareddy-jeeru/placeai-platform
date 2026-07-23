import React, { useState } from 'react';
import { useSession, DEFAULT_DEMO_SESSION } from '../context/SessionContext';

const SkillGapAnalysis = () => {
  const { session } = useSession();
  const activeSession = session || DEFAULT_DEMO_SESSION;
  const [expandedSkill, setExpandedSkill] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#3b82f6';
      default: return '#a0aec0';
    }
  };

  const toggleExpand = (skill) => {
    if (expandedSkill === skill) {
      setExpandedSkill(null);
    } else {
      setExpandedSkill(skill);
    }
  };

  const defaultGaps = [
    {
      skill: 'Docker & Containers',
      priority: 'Critical',
      interviewFreq: 'Very High',
      status: 'In Progress',
      topics: ['Images & Containers', 'Docker Compose', 'Multi-stage Builds', 'Container Networking'],
      resources: ['Learn Docker official tutorials', 'Docker Interview Questions Guide']
    },
    {
      skill: 'REST API Architecture',
      priority: 'High',
      interviewFreq: 'High',
      status: 'Locked',
      topics: ['HTTP Status Codes', 'Request Validation (Pydantic)', 'Rate Limiting', 'API Security'],
      resources: ['FastAPI & REST Guide', 'API Design Best Practices']
    },
    {
      skill: 'SQL Performance & Indexes',
      priority: 'Critical',
      interviewFreq: 'Very High',
      status: 'Locked',
      topics: ['Indexes & Execution Plans', 'Joins & Subqueries', 'Database Migrations', 'Transactions'],
      resources: ['SQL Tuning Masterclass', 'Database Systems Core']
    }
  ];

  const displayGaps = (activeSession.skillGaps && activeSession.skillGaps.length > 0) ? activeSession.skillGaps : defaultGaps;
  const parsedCount = activeSession.extractedSkills ? activeSession.extractedSkills.length : 12;
  const gapCount = displayGaps.length;
  const totalSkillCount = parsedCount + gapCount;
  const matchRatio = Math.round((parsedCount / totalSkillCount) * 100);
  const gapRatio = 100 - matchRatio;

  return (
    <div className="skill-gap-analysis fade-in-up">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">📊 Skill Gap Analysis</h1>
        <p className="page-subtitle">Inspect matching credentials, pinpoint missing tech stacks, and check prioritized learning timetables.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Skill Gap Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Latest Resume Banner */}
          <div className="card" style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            padding: '1rem 1.5rem'
          }}>
            <div className="flex-between">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Active Audited File</span>
                <strong style={{ fontSize: '1rem', color: 'var(--accent-primary)' }}>{activeSession.resumeName || activeSession.uploadedResume?.filename || 'Resume_Parsed.pdf'}</strong>
              </div>
              <span className="badge-tag info">Uploaded {activeSession.uploadedResume?.uploadDate || 'Recently'}</span>
            </div>
          </div>

          <h3 style={{ fontSize: '1.15rem' }}>Identified Skill Gaps ({gapCount})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {displayGaps.map((gap, idx) => {
              const isExpanded = expandedSkill === gap.skill;
              return (
                <div key={idx} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}>
                  <div 
                    onClick={() => toggleExpand(gap.skill)}
                    style={{
                      padding: '1.25rem 1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{gap.skill}</strong>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        <span>Interview Frequency: <strong style={{ color: 'var(--text-primary)' }}>{gap.interviewFreq}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="badge-tag" style={{
                        backgroundColor: `${getPriorityColor(gap.priority)}15`,
                        color: getPriorityColor(gap.priority),
                        border: `1px solid ${getPriorityColor(gap.priority)}30`,
                        margin: 0
                      }}>{gap.priority} Priority</span>
                      <span style={{ fontSize: '0.85rem' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Accordion Expand Details */}
                  {isExpanded && (
                    <div style={{
                      padding: '1.5rem',
                      background: 'rgba(255,255,255,0.02)',
                      borderTop: '1px solid var(--border-color)'
                    }}>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Core Sub-Topics:</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {gap.topics && gap.topics.map((t, topicIdx) => (
                          <span key={topicIdx} style={{
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            border: '1px solid var(--border-color)'
                          }}>{t}</span>
                        ))}
                      </div>

                      <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>AI Recommended Resources:</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => alert(`Launching YouTube playlist for: ${gap.skill}`)}>
                          📺 Watch Playlist
                        </button>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={() => alert(`Opening coding problems for: ${gap.skill}`)}>
                          ⚡ Practice Problems
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Skill Summary statistics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>🛠️ Skill Distribution Profile</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Overall breakdown of skills parsed from your placement credentials:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Matching Skills (Strong)</span>
                  <strong>{parsedCount} parsed</strong>
                </div>
                <div className="bar-container" style={{ margin: '0' }}>
                  <div className="bar-value" style={{ width: `${matchRatio}%`, backgroundColor: 'var(--success)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Identified Gaps (Missing)</span>
                  <strong>{gapCount} gaps</strong>
                </div>
                <div className="bar-container" style={{ margin: '0' }}>
                  <div className="bar-value" style={{ width: `${gapRatio}%`, backgroundColor: 'var(--error)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;
