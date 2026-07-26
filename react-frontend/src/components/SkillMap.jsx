import React from 'react';

export default function SkillMap({ skills = [] }) {
  const defaultSkills = [
    { name: 'Python & FastAPI', score: 88, category: 'Strong' },
    { name: 'React 18 & State', score: 85, category: 'Strong' },
    { name: 'SQL & Indexing', score: 74, category: 'Developing' },
    { name: 'DSA Arrays & Trees', score: 62, category: 'Developing' },
    { name: 'System Design', score: 42, category: 'Needs Attention' }
  ];

  const list = skills.length > 0 ? skills : defaultSkills;

  return (
    <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '1.75rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            SKILL CONSTELLATION
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
            Technical Skill Gap Analysis
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {list.map(s => {
          const color = s.score >= 80 ? '#10b981' : s.score >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={s.name} style={{ background: '#0f1117', border: '1px solid #2d3342', borderRadius: '14px', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
                <span>{s.name}</span>
                <span style={{ color }}>{s.score}% • {s.category}</span>
              </div>
              <div style={{ height: '8px', background: '#1e2438', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${s.score}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
