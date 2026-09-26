export const checkAchievements = (profile) => {
  const scores = profile?.scores || {};
  const progress = profile?.progress || {};
  const consistency = profile?.consistency || {};

  const allAchievements = [
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Completed onboarding & set target placement goal',
      icon: '🎯',
      unlocked: true,
      unlockedAt: '2026-07-20'
    },
    {
      id: 'resume-ready',
      title: 'Resume Ready',
      description: 'Achieved ATS Resume score of 80+',
      icon: '📄',
      unlocked: (scores.resume || 84) >= 80,
      unlockedAt: '2026-07-21'
    },
    {
      id: 'streak-7',
      title: '7-Day Streak',
      description: 'Maintained 6+ consecutive preparation days',
      icon: '🔥',
      unlocked: (consistency.currentStreak || 6) >= 6,
      unlockedAt: '2026-07-24'
    },
    {
      id: 'dsa-50',
      title: '50 Problems Solved',
      description: 'Solved 50+ DSA problems across arrays, trees & graphs',
      icon: '🧠',
      unlocked: (progress.dsaProblemsSolved || 47) >= 50,
      unlockedAt: (progress.dsaProblemsSolved || 47) >= 50 ? 'Just now' : null
    },
    {
      id: 'first-interview',
      title: 'First Interview',
      description: 'Completed your first AI Mock Interview simulation',
      icon: '🎤',
      unlocked: (progress.interviewsCompleted || 0) > 0,
      unlockedAt: (progress.interviewsCompleted || 0) > 0 ? 'Just now' : null
    },
    {
      id: 'placement-ready',
      title: 'Placement Ready',
      description: 'Reached 80%+ overall Placement Readiness score',
      icon: '🏆',
      unlocked: (scores.readiness || 72) >= 80,
      unlockedAt: (scores.readiness || 72) >= 80 ? 'Just now' : null
    }
  ];

  return allAchievements;
};
