// Weighted Placement Readiness Calculator Engine
export const calculateReadinessBreakdown = (scores = {}, progress = {}, consistency = {}) => {
  const resume = scores.resume !== undefined ? scores.resume : 84;
  const interview = scores.interview !== undefined ? scores.interview : 71;
  const skills = scores.skills !== undefined ? scores.skills : 68;
  const jobMatch = scores.jobMatch !== undefined ? scores.jobMatch : 82;
  const dsaSolved = progress.dsaProblemsSolved !== undefined ? progress.dsaProblemsSolved : 47;

  const dsaReadiness = Math.min(100, Math.round((dsaSolved / 60) * 100));
  const profileCompleteness = 90;

  const overall = Math.min(100, Math.max(0, Math.round(
    resume * 0.25 +
    interview * 0.25 +
    skills * 0.25 +
    jobMatch * 0.15 +
    dsaReadiness * 0.10
  )));

  return {
    overall,
    breakdown: [
      { key: 'resume', label: 'Resume Strength', val: resume, color: '#6366f1' },
      { key: 'skills', label: 'Technical Skills', val: skills, color: '#3b82f6' },
      { key: 'dsa', label: 'DSA Readiness', val: dsaReadiness, color: '#8b5cf6' },
      { key: 'interview', label: 'Interview Readiness', val: interview, color: '#ec4899' },
      { key: 'jobMatch', label: 'Company Match Fit', val: jobMatch, color: '#10b981' },
      { key: 'completeness', label: 'Profile Completeness', val: profileCompleteness, color: '#f59e0b' }
    ]
  };
};

export const calculateReadiness = (scores, consistency) => {
  return calculateReadinessBreakdown(scores, {}, consistency).overall;
};
