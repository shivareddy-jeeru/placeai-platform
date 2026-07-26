import React from 'react';
import SkillMap from '../components/SkillMap';
import { useNavigate } from 'react-router-dom';

export default function SkillGapAnalysis() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* HEADER */}
      <div>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          GAP IDENTIFICATION ENGINE
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
          Skill Gap Radar & Analysis ⚡
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
          Visual skill constellation divided into Strong, Developing, and Needs Attention competencies.
        </p>
      </div>

      {/* RECOMMENDED NEXT SKILL HERO CARD */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '24px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            HIGH-VALUE RECOMMENDATION
          </span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
            Recommended Next Skill: System Design & Scalability (42%)
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, maxWidth: '600px', lineHeight: 1.4 }}>
            System Design is currently your largest competency gap for Software Engineer roles at Amazon & TCS. Completing caching and database sharding modules will raise your overall readiness score above 80%.
          </p>
        </div>

        <button
          onClick={() => navigate('/learning-roadmap')}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0.9rem 1.8rem', fontSize: '0.9rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)', whiteSpace: 'nowrap' }}
        >
          Start System Design Path →
        </button>
      </div>

      {/* VISUAL SKILL MAP CONSTELLATION */}
      <SkillMap />
    </div>
  );
}
