import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';

const JobMatcher = () => {
  const { session } = useSession();
  const [selectedJobId, setSelectedJobId] = useState('job-1');

  if (!session) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 className="page-title">💼 Job Description Matcher</h1>
          <p className="page-subtitle">Cross-reference your active resume with custom job requirements to inspect semantic alignment and fit.</p>
        </header>
        
        <div className="card" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <div style={{ fontSize: '4rem' }}>💼</div>
          <h2>No Resume Uploaded</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            Upload your resume in the Resume Analyzer module first to enable job compatibility scoring.
          </p>
        </div>
      </div>
    );
  }

  const defaultJobMatches = [
    {
      id: 'job-1',
      title: 'Software Development Engineer (SDE-1)',
      company: 'Amazon',
      location: 'Bangalore / Remote',
      matchScore: 84,
      verdict: 'Prepare for 2 Weeks',
      verdictColor: '#f59e0b',
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
      title: 'Digital Software Engineer',
      company: 'TCS',
      location: 'Hyderabad / Pune',
      matchScore: 92,
      verdict: 'Ready to Apply Now',
      verdictColor: '#10b981',
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
      title: 'Advanced Application Developer',
      company: 'Accenture',
      location: 'Bangalore / Gurgaon',
      matchScore: 88,
      verdict: 'Ready to Apply Now',
      verdictColor: '#10b981',
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

  const matches = (session && Array.isArray(session.jobMatches) && session.jobMatches.length > 0) ? session.jobMatches : defaultJobMatches;
  const selectedJob = matches.find(j => j.id === selectedJobId) || matches[0];

  return (
    <div className="job-matcher">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">💼 Job Description Matcher</h1>
        <p className="page-subtitle">Cross-reference your active resume with custom job requirements to inspect semantic alignment and fit.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        {/* Left Column: Match selection cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem' }}>Matched Opportunities</h3>
          {matches.map(job => {
            const isSelected = job.id === selectedJobId;
            return (
              <div 
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                style={{
                  padding: '1.25rem',
                  background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    color: 'var(--accent-primary)',
                    fontWeight: 'bold',
                    border: '1px solid var(--border-color)'
                  }}>
                    {job.logo}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{job.role}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{job.company}</span>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    color: getScoreColor(job.matchPercent)
                  }}>
                    {job.matchPercent}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Matched vs. Missing breakdown details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {selectedJob ? (
            <div className="card">
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {selectedJob.logo}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{selectedJob.role}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedJob.company}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: getScoreColor(selectedJob.matchPercent) }}>{selectedJob.matchPercent}% Match</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Compatibility Index</span>
                </div>
              </div>

              {/* Matched vs Missing grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--success)', marginBottom: '0.75rem' }}>🟢 Matched Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedJob.matchedSkills.map((s, idx) => (
                      <span key={idx} className="badge-tag match" style={{ margin: 0 }}>{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--error)', marginBottom: '0.75rem' }}>🔴 Missing Tech stack</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedJob.missingSkills.map((s, idx) => (
                      <span key={idx} className="badge-tag missing" style={{ margin: 0 }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn btn-secondary">📄 View Full Job description</button>
                <button className="btn btn-primary" onClick={() => alert(`Redirecting to target application portal...`)}>🚀 Apply Now</button>
              </div>
            </div>
          ) : (
            <p>Select a job role from the matched list to inspect compatibility breakdown.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatcher;
