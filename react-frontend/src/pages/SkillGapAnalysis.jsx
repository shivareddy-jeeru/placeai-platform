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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1380px', margin: '0 auto', paddingBottom: '6rem' }}>
      
      {/* ─── HERO HEADER ─────────────────────────────────────────────── */}
      <div className="saas-hero-card" style={{ padding: '2.8rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '780px' }}>
            <span className="saas-pill" style={{ marginBottom: '1rem' }}>
              TECHNICAL SKILL CONSTELLATION
            </span>
            <h1 className="hero-giant-title" style={{ margin: '0.4rem 0 0.8rem 0' }}>
              Skill Map & Gap Radar ⚡
            </h1>
            <p className="hero-lead-text" style={{ margin: 0 }}>
              An interactive visual map of your technical competencies across Backend, Frontend, and AI domains. Click any node to drill into resources, estimated time, and practice milestones.
            </p>
          </div>

          <button
            onClick={() => navigate('/roadmap')}
            className="btn btn-primary"
            style={{ borderRadius: '16px', padding: '0.9rem 2rem', fontSize: '0.95rem', fontWeight: 800 }}
          >
            Open Learning Roadmap →
          </button>
        </div>
      </div>

      {/* ─── VISUAL SKILL MAP COMPONENT ──────────────────────────────── */}
      <SkillMap />

    </div>
  );
}
