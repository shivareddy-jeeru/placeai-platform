import React from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

export default function AchievementsView() {
  const navigate = useNavigate();
  const { session, updateStudentProfile } = useSession();

  const achievements = session?.achievements || [
    { id: 'a1', title: 'Resume Master', desc: 'ATS score above 80', icon: '🏆', unlocked: true, unlockedDate: '2 days ago' },
    { id: 'a2', title: '7 Day Streak', desc: 'Practiced for 7 consecutive days', icon: '🔥', unlocked: true, unlockedDate: 'Today' },
    { id: 'a3', title: 'Interview Ready', desc: 'Completed 10 mock interviews', icon: '🎯', unlocked: true, unlockedDate: 'Yesterday' },
    { id: 'a4', title: 'DSA Explorer', desc: 'Solved 50 problems', icon: '💻', unlocked: true, unlockedDate: '3 days ago' },
    { id: 'a5', title: 'Placement Ready', desc: 'Readiness score above 80', icon: '🚀', unlocked: false, progress: 72, total: 80 },
    { id: 'a6', title: 'Cloud Specialist', desc: 'Master Docker & AWS containerization', icon: '☁️', unlocked: false, progress: 1, total: 3 },
  ];

  const handleUnlockAchievement = (achId) => {
    const updated = achievements.map(a => a.id === achId ? { ...a, unlocked: true, unlockedDate: 'Just now' } : a);
    updateStudentProfile({
      achievements: updated,
      message: `🏆 Achievement unlocked! Badge added to your placement profile.`
    });
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1380px', margin: '0 auto', paddingBottom: '6rem' }}>
      
      {/* ─── HERO HEADER ─────────────────────────────────────────────── */}
      <div className="saas-hero-card" style={{ padding: '2.8rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '780px' }}>
            <span className="saas-pill" style={{ marginBottom: '1rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              PLACEMENT REWARD MILESTONES
            </span>
            <h1 className="hero-giant-title" style={{ margin: '0.4rem 0 0.8rem 0' }}>
              YOUR ACHIEVEMENTS 🏆
            </h1>
            <p className="hero-lead-text" style={{ margin: 0 }}>
              Celebrate your preparation consistency. Unlock badges as you optimize your resume, solve DSA challenges, and conquer mock interview simulations.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1.1rem 1.8rem', borderRadius: '20px', border: '1px solid var(--border-default)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Badges Unlocked</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>{unlockedCount} of {achievements.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>🔥 7-Day Active Streak</div>
          </div>
        </div>

        {/* 3 Quick Metric Counters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          marginTop: '2rem',
        }}>
          <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Streak</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', margin: '0.2rem 0' }}>🔥 7 Days</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Active everyday this week</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>DSA Solved</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--indigo-light)', margin: '0.2rem 0' }}>💻 50 Problems</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target: 120 medium problems</div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mock Rounds</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ec4899', margin: '0.2rem 0' }}>🎯 10 Completed</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Avg score: 79/100</div>
          </div>
        </div>
      </div>

      {/* ─── ACHIEVEMENTS GRID ────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.35rem',
      }}>
        {achievements.map(a => (
          <div
            key={a.id}
            style={{
              background: a.unlocked ? 'var(--bg-card)' : 'var(--bg-surface)',
              border: `1.5px solid ${a.unlocked ? 'var(--indigo)' : 'var(--border-default)'}`,
              borderRadius: '22px',
              padding: '1.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              opacity: a.unlocked ? 1 : 0.65,
              boxShadow: a.unlocked ? 'var(--shadow-md)' : 'none',
              transition: 'all 0.25s ease',
            }}
          >
            {/* Icon Bubble */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: a.unlocked ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-overlay)',
              border: `1px solid ${a.unlocked ? 'var(--indigo)' : 'var(--border-default)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              flexShrink: 0,
            }}>
              {a.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  {a.title}
                </h3>
                {a.unlocked ? (
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                    UNLOCKED
                  </span>
                ) : (
                  <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>
                    IN PROGRESS
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.4rem 0', lineHeight: 1.4 }}>
                {a.desc}
              </p>

              {a.unlocked ? (
                <span style={{ fontSize: '0.72rem', color: 'var(--indigo-light)', fontWeight: 700 }}>
                  ✓ Unlocked {a.unlockedDate || 'Recently'}
                </span>
              ) : (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    <span>Progress: {a.progress} / {a.total}</span>
                    <button
                      onClick={() => handleUnlockAchievement(a.id)}
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid var(--indigo)',
                        color: 'var(--indigo-light)',
                        borderRadius: '6px',
                        padding: '0.15rem 0.45rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Claim badge completion"
                    >
                      ⚡ Claim Badge
                    </button>
                  </div>
                  <div style={{ height: '5px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${(a.progress / a.total) * 100}%`, height: '100%', background: 'var(--indigo)', borderRadius: '99px' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
