export const calculateNextBestAction = (profile) => {
  const scores = profile?.scores || {};
  const progress = profile?.progress || {};

  if ((scores.resume || 84) < 80) {
    return {
      id: 'improve-resume',
      title: 'Optimize Resume Impact Statements',
      description: 'Your ATS Resume score is 78/100. Adding quantifiable metrics to your project descriptions will boost your ATS match score above 85%.',
      estimatedTime: '15 mins',
      impact: 'Potential impact: +6% readiness',
      route: '/resume',
      priority: 'HIGH',
      reason: 'Resume ATS score is below target 85 benchmark.'
    };
  }

  if ((progress.dsaProblemsSolved || 47) < 50) {
    return {
      id: 'dsa-50',
      title: 'Solve 3 DSA Array & Tree Problems',
      description: 'You have solved 47 DSA problems. Solving 3 more will cross the 50-problem milestone and unlock the "50 Problems Solved" achievement!',
      estimatedTime: '30 mins',
      impact: 'Potential impact: +5% readiness',
      route: '/learning-roadmap',
      priority: 'HIGH',
      reason: 'Close to 50 DSA milestone achievement.'
    };
  }

  if ((scores.interview || 71) < 75) {
    return {
      id: 'mock-interview',
      title: 'Complete 1 STAR Behavioral Mock Interview',
      description: 'Your Interview Readiness score is 71%. Practice 5 STAR method scenarios with real-time AI feedback to reach 80%+ readiness.',
      estimatedTime: '20 mins',
      impact: 'Potential impact: +4% readiness',
      route: '/interview',
      priority: 'HIGH',
      reason: 'STAR interview rubric score has room for improvement.'
    };
  }

  return {
    id: 'system-design',
    title: 'Study System Design & Scalability Fundamentals',
    description: 'System Design is your highest-impact skill gap (42%). Review caching, load balancing, and database indexing to prepare for senior rounds.',
    estimatedTime: '25 mins',
    impact: 'Potential impact: +7% readiness',
    route: '/skills',
    priority: 'MEDIUM',
    reason: 'System Design identified as top competency gap.'
  };
};
