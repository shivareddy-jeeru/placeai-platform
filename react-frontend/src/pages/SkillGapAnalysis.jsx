import React from 'react';
import SkillMap from '../components/SkillMap';
import usePlacementProfile from '../hooks/usePlacementProfile';
import { useNavigate } from 'react-router-dom';

export default function SkillGapAnalysis() {
  const { placementProfile } = usePlacementProfile();
  const navigate = useNavigate();

  const atsResult = placementProfile?.atsResult || null;
  const topMissingSkill = atsResult?.missingSkills?.[0] || 'System Design & Distributed Scalability';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '140px' }}>
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
      {atsResult ? (
        <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '24px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              HIGH-VALUE AUDIT RECOMMENDATION
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
              Priority Skill Gap: {topMissingSkill}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, maxWidth: '600px', lineHeight: 1.4 }}>
              Detected as your primary missing requirement for target Software Engineer roles. Closing this skill gap will boost your placement readiness score.
            </p>
          </div>

          <button
            onClick={() => navigate('/learning-roadmap')}
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0.9rem 1.8rem', fontSize: '0.9rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)', whiteSpace: 'nowrap' }}
          >
            Start Learning Roadmap →
          </button>
        </div>
      ) : (
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '800', margin: '0 0 0.3rem 0' }}>
              No Resume Uploaded Yet
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
              Upload your resume in the Resume Analyzer to extract candidate technical skills and benchmark missing skill gaps.
            </p>
          </div>
          <button
            onClick={() => navigate('/resume')}
            style={{ background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.7rem 1.4rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}
          >
            ☁️ Upload Resume →
          </button>
        </div>
      )}

      {/* VISUAL SKILL MAP CONSTELLATION */}
      <SkillMap />
    </div>
  );
}
