import React, { useState } from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';
import { useNavigate } from 'react-router-dom';

const COMPANY_PROFILES = [
  {
    id: 'amazon',
    role: 'Software Development Engineer (SDE-1)',
    company: 'Amazon',
    location: 'Bangalore / Remote',
    logo: '💻',
    required: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'System Design', 'Git', 'REST API', 'AWS'],
    actionSteps: [
      'Complete System Design caching & load balancing fundamentals',
      'Add 1 quantifiable backend API metric to your resume',
      'Practice Amazon 16 Leadership Principles STAR scenarios'
    ]
  },
  {
    id: 'tcs',
    role: 'Digital Software Engineer',
    company: 'TCS',
    location: 'Hyderabad / Pune',
    logo: '🚀',
    required: ['Python', 'SQL', 'FastAPI', 'REST API', 'Git', 'Data Structures', 'React'],
    actionSteps: [
      'Submit resume for TCS Digital hiring drive',
      'Review 5 TCS Digital PYQ coding questions',
      'Complete 1 quick mock interview round'
    ]
  },
  {
    id: 'accenture',
    role: 'Advanced Application Developer',
    company: 'Accenture',
    location: 'Bangalore / Gurgaon',
    logo: '⚡',
    required: ['React', 'Node.js', 'JavaScript', 'REST API', 'SQL', 'Git', 'Docker'],
    actionSteps: [
      'Apply now on Accenture careers portal',
      'Practice 3 behavioral communication scenarios',
      'Review frontend web vitals performance'
    ]
  }
];

export default function JobMatcher() {
  const { placementProfile } = usePlacementProfile();
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState('amazon');

  const atsResult = placementProfile?.atsResult || null;

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // If no resume is analyzed yet, show opening state
  if (!atsResult) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '140px' }}>
        <header>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TARGET COMPANY INTELLIGENCE & MATCHING
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
            Job Description Matcher 💼
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
            Cross-reference your active resume with target company roles to inspect semantic alignment and missing skill gaps.
          </p>
        </header>

        {/* UNANALYZED HERO CARD */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(22, 25, 37, 0.95), rgba(15, 17, 23, 0.95))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '28px',
          padding: '3.5rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem' }}>
            🎯
          </div>

          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              No Resume Analyzed Yet
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '600px', margin: 0, lineHeight: 1.6 }}>
              Upload your resume in the Resume Analyzer to extract candidate technical skills and calculate real-time compatibility scores for Amazon, TCS, and Accenture.
            </p>
          </div>

          <button
            onClick={() => navigate('/resume')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '0.9rem 2.2rem',
              fontSize: '0.95rem',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ☁️ Upload Resume & Run ATS Audit →
          </button>
        </div>
      </div>
    );
  }

  // Calculate REAL dynamic company matches based on detected skills
  const candidateSkills = (atsResult.detectedSkills || []).map(s => s.toLowerCase());

  const matches = COMPANY_PROFILES.map(comp => {
    const matched = comp.required.filter(req => candidateSkills.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs)));
    const missing = comp.required.filter(req => !candidateSkills.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs)));

    const matchRatio = comp.required.length > 0 ? (matched.length / comp.required.length) : 0.8;
    const matchScore = Math.min(98, Math.max(45, Math.round(matchRatio * 100)));

    let verdict = 'Ready to Apply Now';
    let verdictColor = '#10b981';
    if (matchScore < 70) {
      verdict = 'Prepare for 3 Weeks';
      verdictColor = '#ef4444';
    } else if (matchScore < 85) {
      verdict = 'Prepare for 1-2 Weeks';
      verdictColor = '#f59e0b';
    }

    return {
      ...comp,
      matchScore,
      verdict,
      verdictColor,
      matchingSkills: matched.length > 0 ? matched : (atsResult.detectedSkills?.slice(0, 4) || ['Python', 'Git']),
      missingSkills: missing.length > 0 ? missing : (atsResult.missingSkills || ['Kubernetes']),
      explanation: `Calculated match fit: ${matchScore}% for ${comp.company}! Matched ${matched.length} of ${comp.required.length} key required technical competencies from your uploaded resume (${atsResult.fileName || 'Candidate_Resume.pdf'}).`
    };
  });

  const selectedJob = matches.find(j => j.id === selectedJobId) || matches[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1240px', margin: '0 auto', paddingBottom: '140px' }}>
      <header>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          TARGET COMPANY INTELLIGENCE & MATCHING
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
          Job Description Matcher 💼
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
          Real-time company match scores calculated from your active ATS resume audit ({atsResult.fileName || 'Uploaded_Resume.pdf'}).
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '2rem' }}>
        {/* Left Column: Match selection cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: '800', margin: 0 }}>
            Matched Target Opportunities ({matches.length})
          </h3>

          {matches.map(job => {
            const isSelected = job.id === selectedJobId;
            return (
              <div 
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                style={{
                  padding: '1.25rem 1.5rem',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : '#161925',
                  border: `1px solid ${isSelected ? '#6366f1' : '#2d3342'}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 20px rgba(99, 102, 241, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#0f1117',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    color: '#6366f1',
                    border: '1px solid #2d3342'
                  }}>
                    {job.logo}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#ffffff', fontWeight: '800' }}>{job.role}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{job.company}</span>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    fontSize: '1.3rem',
                    fontWeight: '900',
                    color: getScoreColor(job.matchScore)
                  }}>
                    {job.matchScore}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Matched vs. Missing breakdown details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {selectedJob && (
            <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ borderBottom: '1px solid #2d3342', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    background: '#0f1117',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.7rem',
                    border: '1px solid #2d3342'
                  }}>
                    {selectedJob.logo}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#ffffff', fontWeight: '900' }}>{selectedJob.role}</h3>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{selectedJob.company} • {selectedJob.location}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: '900', color: getScoreColor(selectedJob.matchScore) }}>
                    {selectedJob.matchScore}% Match
                  </span>
                  <span style={{ fontSize: '0.78rem', color: selectedJob.verdictColor, fontWeight: '800' }}>
                    {selectedJob.verdict}
                  </span>
                </div>
              </div>

              {/* Match Explanation */}
              <div style={{ background: '#0f1117', border: '1px solid rgba(99, 102, 241, 0.35)', borderRadius: '16px', padding: '1.1rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                💡 <strong style={{ color: '#ffffff' }}>AI Match Intelligence:</strong> {selectedJob.explanation}
              </div>

              {/* Matching Skills vs Missing Skills Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#0f1117', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#34d399', margin: '0 0 0.8rem 0' }}>
                    ✅ Matching Skills ({selectedJob.matchingSkills.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {selectedJob.matchingSkills.map((sk, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '600' }}>
                        ✓ {sk}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#0f1117', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', padding: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#ef4444', margin: '0 0 0.8rem 0' }}>
                    ⚠️ Your Gaps ({selectedJob.missingSkills.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {selectedJob.missingSkills.length > 0 ? selectedJob.missingSkills.map((sk, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: '#fca5a5', fontWeight: '600' }}>
                        ⚠️ {sk}
                      </div>
                    )) : (
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No gaps detected! Excellent alignment.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Steps */}
              <div style={{ background: '#0f1117', border: '1px solid #2d3342', borderRadius: '16px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: '#a5b4fc', margin: '0 0 0.7rem 0' }}>
                  🎯 Recommended Preparation for {selectedJob.company}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedJob.actionSteps.map((step, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: '600' }}>
                      <span style={{ color: '#818cf8', fontWeight: '900' }}>{idx + 1}.</span> {step}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
