import React from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';
import AchievementBadge from '../components/AchievementBadge';

export default function AchievementsView() {
  const { placementProfile } = usePlacementProfile();
  const achievements = placementProfile?.achievements || [];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            PREPARATION MILESTONES
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
            Milestones & Badges 🏆
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
            Track unlocked achievements as you complete roadmap phases, solve DSA problems, and practice mock interviews.
          </p>
        </div>

        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '18px', padding: '0.8rem 1.4rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>BADGES UNLOCKED</span>
          <strong style={{ fontSize: '1.3rem', color: '#10b981', display: 'block' }}>{unlockedCount} of {achievements.length}</strong>
        </div>
      </div>

      {/* BADGES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {achievements.map(a => (
          <AchievementBadge key={a.id} achievement={a} />
        ))}
      </div>
    </div>
  );
}
