import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';

const JobMatcher = () => {
  const { session } = useSession();
  const [selectedJobId, setSelectedJobId] = useState('job-1');

  const defaultJobMatches = [
    {
      id: 'job-1',
      role: 'Software Development Engineer (SDE-1)',
      title: 'Software Development Engineer (SDE-1)',
      company: 'Amazon',
      location: 'Bangalore / Remote',
      matchPercent: 84,
      matchScore: 84,
      verdict: 'Prepare for 2 Weeks',
      verdictColor: '#f59e0b',
      logo: '💻',
      matchingSkills: ['Python 3', 'React 18', 'RESTful APIs', 'SQL Database Queries', 'Git Version Control'],
      missingSkills: ['Docker Containerization', 'System Design & Scalability', 'AWS Cloud Services'],
      actionSteps: [
        'Complete System Design caching & load balancing fundamentals',
        'Add 1 quantifiable backend API metric to your resume',
        'Practice Amazon 16 Leadership Principles STAR scenarios'
      ],
      explanation: 'You are a strong 84% match for Amazon SDE-1! Your React, Python, and REST API experience align with 80%+ of core technical requirements. Addressing your System Design gap will bring you to 90%+ fit.'
    },
    {
      id: 'job-2',
      role: 'Digital Software Engineer',
      title: 'Digital Software Engineer',
      company: 'TCS',
      location: 'Hyderabad / Pune',
      matchPercent: 92,
      matchScore: 92,
      verdict: 'Ready to Apply Now',
      verdictColor: '#10b981',
      logo: '🚀',
      matchingSkills: ['Python', 'SQL', 'FastAPI', 'Data Structures', 'Git'],
      missingSkills: ['Enterprise Java', 'Unix Shell Scripting'],
      actionSteps: [
        'Submit resume for TCS Digital hiring drive',
        'Review 5 TCS Digital PYQ coding questions',
        'Complete 1 quick mock interview round'
      ],
      explanation: 'Outstanding 92% Match for TCS Digital Engineer! Your DSA problem-solving count and API skills exceed the baseline threshold.'
    },
    {
      id: 'job-3',
      role: 'Advanced Application Developer',
      title: 'Advanced Application Developer',
      company: 'Accenture',
      location: 'Bangalore / Gurgaon',
      matchPercent: 88,
      matchScore: 88,
      verdict: 'Ready to Apply Now',
      verdictColor: '#10b981',
      logo: '⚡',
      matchingSkills: ['React 18', 'TypeScript', 'SQL', 'Git', 'Agile Principles'],
      missingSkills: ['Cloud Infrastructure', 'CI/CD Pipelines'],
      actionSteps: [
        'Apply now on Accenture careers portal',
        'Practice 3 behavioral communication scenarios',
        'Review frontend web vitals performance'
      ],
      explanation: 'Strong 88% Match! Your React 18, TypeScript, and Agile experience fit Accenture requirements cleanly.'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const matches = (session && Array.isArray(session.jobMatches) && session.jobMatches.length > 0) ? session.jobMatches : defaultJobMatches;
  const selectedJob = matches.find(j => j.id === selectedJobId) || matches[0];

  return (
    <div className="job-matcher fade-in-up" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          TARGET COMPANY INTELLIGENCE & MATCHING
        </span>
        <h1 className="page-title" style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
          Job Description Matcher 💼
        </h1>
        <p className="page-subtitle" style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
          Cross-reference your active resume with custom job requirements to inspect semantic alignment and fit.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        {/* Left Column: Match selection cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: '800' }}>Matched Target Opportunities</h3>
          {matches.map(job => {
            const isSelected = job.id === selectedJobId;
            const scoreVal = job.matchPercent || job.matchScore || 80;
            return (
              <div 
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                style={{
                  padding: '1.25rem',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : '#161925',
                  border: `1px solid ${isSelected ? '#6366f1' : '#2d3342'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#0f1117',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    color: '#6366f1',
                    border: '1px solid #2d3342'
                  }}>
                    {job.logo || '💼'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', fontWeight: '800' }}>{job.role || job.title}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{job.company}</span>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: '1.15rem',
                    fontWeight: '900',
                    color: getScoreColor(scoreVal)
                  }}>
                    {scoreVal}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Matched vs. Missing breakdown details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {selectedJob && (
            <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '1.75rem' }}>
              <div style={{ borderBottom: '1px solid #2d3342', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    background: '#0f1117',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    border: '1px solid #2d3342'
                  }}>
                    {selectedJob.logo || '💼'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#ffffff', fontWeight: '900' }}>{selectedJob.role || selectedJob.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{selectedJob.company} • {selectedJob.location || 'Remote'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '1.6rem', fontWeight: '900', color: getScoreColor(selectedJob.matchPercent || selectedJob.matchScore || 80) }}>
                    {selectedJob.matchPercent || selectedJob.matchScore || 80}% Match
                  </span>
                  <span style={{ fontSize: '0.75rem', color: selectedJob.verdictColor || '#10b981', fontWeight: '800' }}>
                    {selectedJob.verdict || 'Ready to Apply'}
                  </span>
                </div>
              </div>

              {/* Match Explanation */}
              {selectedJob.explanation && (
                <div style={{ background: '#0f1117', border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '16px', padding: '1.1rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  💡 <strong style={{ color: '#ffffff' }}>AI Match Intelligence:</strong> {selectedJob.explanation}
                </div>
              )}

              {/* Matching Skills vs Missing Skills Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#0f1117', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#34d399', margin: '0 0 0.8rem 0' }}>
                    ✅ Matching Skills ({selectedJob.matchingSkills?.length || 0})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {(selectedJob.matchingSkills || []).map((sk, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '600' }}>
                        ✓ {sk}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#0f1117', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#ef4444', margin: '0 0 0.8rem 0' }}>
                    ⚠️ Your Gaps ({selectedJob.missingSkills?.length || 0})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {(selectedJob.missingSkills || []).map((sk, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: '#fca5a5', fontWeight: '600' }}>
                        ⚠️ {sk}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Steps */}
              {selectedJob.actionSteps && (
                <div style={{ background: '#0f1117', border: '1px solid #2d3342', borderRadius: '16px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#a5b4fc', margin: '0 0 0.7rem 0' }}>
                    🎯 What to do before applying to {selectedJob.company}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {selectedJob.actionSteps.map((step, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '600' }}>
                        <span style={{ color: '#818cf8', fontWeight: '900' }}>{idx + 1}.</span> {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatcher;
