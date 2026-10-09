import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const RECRUITERS = [
  {
    id: 'amazon',
    company: 'Amazon',
    role: 'Software Development Engineer (SDE-1)',
    tier: 'Product',
    difficulty: 8.5,
    match: 82,
    skills: ['Python', 'DSA', 'AWS Cloud', 'SQL'],
    date: 'Verified Spring 2026 Batch',
    rounds: ['Online Coding Assessment (2 questions, 70 mins)', 'Technical Round 1 (DSA Trees/Graphs & Coding)', 'Technical Round 2 (System Design & Code Quality)', 'Bar Raiser (STAR Leadership Principles)'],
    cutoffs: 'CGPA: 7.5+ • No active backlogs',
    pyq: ['Binary Tree Maximum Path Sum', 'Course Schedule II', 'LRU Cache implementation', 'Design Amazon Locker System'],
    plan: 'Spend 7 days mastering Docker and AWS fundamentals. Review 16 Leadership Principles scenarios.'
  },
  {
    id: 'google',
    company: 'Google',
    role: 'Software Engineer (L3)',
    tier: 'Product',
    difficulty: 9.5,
    match: 75,
    skills: ['DSA Hard', 'System Design', 'Algorithms', 'C++ / Java'],
    date: 'Verified Spring 2026 Batch',
    rounds: ['Screening Technical Telephonic (45 mins)', 'Onsite Round 1 (Complex Graph Algorithms)', 'Onsite Round 2 (Dynamic Programming & Optimization)', 'Onsite Round 3 (Large-Scale System Architecture)', 'Googliness & Behavioral Round'],
    cutoffs: 'CGPA: 8.0+ • Strong competitive programming profile',
    pyq: ['Trapping Rain Water II', 'Word Ladder II', 'Serialize and Deserialize Binary Tree', 'Median of Two Sorted Arrays'],
    plan: 'Solve 25 LeetCode Hard Dynamic Programming and Graph problems. Review clean code modularity.'
  },
  {
    id: 'microsoft',
    company: 'Microsoft',
    role: 'Software Engineer',
    tier: 'Product',
    difficulty: 9.0,
    match: 80,
    skills: ['DSA', 'OOPs Design', 'Azure / Cloud', 'System Architecture'],
    date: 'Verified Spring 2026 Batch',
    rounds: ['Online Assessment (3 questions on Codility)', 'Technical Round 1 (Trees, Linked Lists & Strings)', 'Technical Round 2 (Low-Level Object Oriented Design)', 'Technical Round 3 (Design Patterns & Cloud Concepts)', 'AA Interview (Leadership & Cultural Alignment)'],
    cutoffs: 'CGPA: 7.5+ • Computer Science & IT streams',
    pyq: ['Reverse Nodes in k-Group', 'Design Tic-Tac-Toe', 'Find Median from Data Stream', 'Merge k Sorted Lists'],
    plan: 'Practice low level design (OOP class diagrams) and concurrent data structures in Python/Java.'
  },
  {
    id: 'tcs',
    company: 'TCS',
    role: 'Digital Software Engineer',
    tier: 'IT Services',
    difficulty: 6.0,
    match: 91,
    skills: ['Python', 'SQL', 'Core CS', 'Aptitude & Logic'],
    date: 'Verified Spring 2026 Batch',
    rounds: ['TCS NQT Cognitive & Advanced Coding Assessment (180 mins)', 'Technical Interview (Core CS, DBMS, OS & Projects)', 'Managerial Interview', 'HR Round'],
    cutoffs: 'CGPA: 6.5+ • Min 60% in Class X and XII',
    pyq: ['Prime number generation in range', 'Matrix spiral traversal', 'SQL JOIN and GROUP BY aggregation', 'String anagram permutations'],
    plan: 'Your match is 91%! Review 5 previous year coding questions and DBMS indexing basics.'
  },
  {
    id: 'infosys',
    company: 'Infosys',
    role: 'Specialist Programmer (Power Programmer)',
    tier: 'IT Services',
    difficulty: 7.0,
    match: 88,
    skills: ['Java', 'DSA Medium', 'REST APIs', 'DBMS'],
    date: 'Verified Spring 2026 Batch',
    rounds: ['HackWithInfy / InfyTQ Advanced Coding Test (3 algorithmic questions)', 'Technical Interview (Live coding and project walkthrough)', 'HR Interview'],
    cutoffs: 'CGPA: 6.5+ • Strong performance in coding qualifier',
    pyq: ['Longest Palindromic Substring', 'Coin Change problem', 'Graph cycle detection', 'SQL Subquery optimization'],
    plan: 'Review Dynamic Programming patterns and prepare detailed explanations of your PlaceAI database.'
  },
  {
    id: 'accenture',
    company: 'Accenture',
    role: 'Advanced Application Developer (AASE)',
    tier: 'Consulting',
    difficulty: 6.5,
    match: 85,
    skills: ['React', 'Node.js', 'Cloud Basics', 'SQL'],
    date: 'Verified Spring 2026 Batch',
    rounds: ['Cognitive and Technical Assessment', 'Coding Assessment (2 questions)', 'Communication Assessment', 'Technical + HR Interview'],
    cutoffs: 'CGPA: 6.5+ • Good spoken English communication',
    pyq: ['Array subarray with given sum', 'Reverse words in given string', 'SQL Second highest salary', 'React lifecycle/hooks questions'],
    plan: 'Practice 3 STAR behavioral scenarios and review frontend web vitals and REST error codes.'
  },
  {
    id: 'capgemini',
    company: 'Capgemini',
    role: 'Senior Software Analyst',
    tier: 'Consulting',
    difficulty: 6.0,
    match: 86,
    skills: ['Java', 'Spring Boot', 'SQL', 'Agile Principles'],
    date: 'Verified Spring 2026 Batch',
    rounds: ['Pseudo-code & English Assessment', 'Spoken English Assessment', 'Coding Round (2 questions)', 'Technical + HR Combined Panel'],
    cutoffs: 'CGPA: 6.0+ • All Engineering streams eligible',
    pyq: ['Fibonacci series with memoization', 'Remove duplicate characters in string', 'SQL inner join queries'],
    plan: 'Focus on pseudo-code output tracing and Java OOP definitions (Polymorphism, Abstraction).'
  },
  {
    id: 'deloitte',
    company: 'Deloitte',
    role: 'Consultant Tech — Software Engineering',
    tier: 'Consulting',
    difficulty: 7.0,
    match: 84,
    skills: ['Cloud', 'Python', 'SQL', 'System Architecture'],
    date: 'Verified Spring 2026 Batch',
    rounds: ['Aptitude & Technical MCQ Assessment', 'Group Discussion / Business Case Study', 'Technical Interview (Projects & System flow)', 'Partner / HR Round'],
    cutoffs: 'CGPA: 7.0+ • Good presentation skills',
    pyq: ['Client-server architectural design', 'Database normalization forms (1NF-3NF)', 'REST vs GraphQL comparison'],
    plan: 'Prepare concise business-oriented explanations of how PlaceAI delivers measurable placement ROI.'
  },
];

export default function CompanyResearch() {
  const navigate = useNavigate();
  const { session, toggleTargetCompany } = useSession();

  const [filterTier, setFilterTier] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const filteredRecruiters = RECRUITERS.filter(r => {
    const matchesTier = filterTier === 'All' || r.tier === filterTier;
    const matchesSearch = r.company.toLowerCase().includes(searchQuery.toLowerCase()) || r.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1380px', margin: '0 auto', paddingBottom: '6rem' }}>
      
      {/* ─── HERO HEADER ─────────────────────────────────────────────── */}
      <div className="saas-hero-card" style={{ padding: '2.8rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '800px' }}>
            <span className="saas-pill" style={{ marginBottom: '1rem' }}>
              CAMPUS RECRUITER DOSSIERS
            </span>
            <h1 className="hero-giant-title" style={{ margin: '0.4rem 0 0.8rem 0' }}>
              Company Intelligence Hub 🏢
            </h1>
            <p className="hero-lead-text" style={{ margin: 0 }}>
              Up-to-date campus recruitment criteria, verified hiring difficulty ratings, candidate skill compatibility matches, and round-by-round interview plans.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.6rem', borderRadius: '18px', border: '1px solid var(--border-default)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hiring Season</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--indigo-light)' }}>Spring 2026 Batch</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>8 Companies Tracked</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or role (e.g. Amazon, Google, SDE-1)..."
            style={{
              flex: 1,
              minWidth: '280px',
              maxWidth: '480px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '14px',
              padding: '0.75rem 1.2rem',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['All', 'Product', 'IT Services', 'Consulting'].map(t => (
              <button
                key={t}
                onClick={() => setFilterTier(t)}
                style={{
                  background: filterTier === t ? 'var(--indigo)' : 'var(--bg-surface)',
                  color: filterTier === t ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${filterTier === t ? 'var(--indigo)' : 'var(--border-default)'}`,
                  borderRadius: '10px',
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── COMPANY CARDS GRID ───────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
      }}>
        {filteredRecruiters.map(recruiter => {
          const difficultyBars = Math.round(recruiter.difficulty);
          return (
            <div
              key={recruiter.id}
              className="card"
              style={{
                borderRadius: '24px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.25rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.68rem', marginBottom: '0.35rem' }}>{recruiter.tier}</span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                      {recruiter.company}
                    </h3>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {recruiter.role}
                    </div>
                  </div>

                  {/* Match percentage badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: recruiter.match >= 85 ? '#10b981' : 'var(--indigo-light)' }}>
                      {recruiter.match}%
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Your Match
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                  📅 {recruiter.date}
                </div>

                {/* Hiring Difficulty Gauge */}
                <div style={{ background: 'var(--bg-surface)', padding: '0.9rem', borderRadius: '14px', border: '1px solid var(--border-default)', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Hiring Difficulty:</span>
                    <span style={{ color: recruiter.difficulty >= 8.5 ? '#ef4444' : '#f59e0b' }}>{recruiter.difficulty} / 10</span>
                  </div>
                  <div style={{ height: '7px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${recruiter.difficulty * 10}%`, height: '100%', background: recruiter.difficulty >= 8.5 ? '#ef4444' : '#f59e0b', borderRadius: '99px' }} />
                  </div>
                </div>

                {/* Skills Required */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Skills Required:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {recruiter.skills.map(s => (
                      <span key={s} className="badge-tag info" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions: View Prep Plan & Target Toggle */}
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={() => setSelectedPlan(recruiter)}
                  className="btn btn-primary"
                  style={{ borderRadius: '14px', padding: '0.8rem', flex: 1, fontSize: '0.88rem', fontWeight: 800 }}
                >
                  Prep Dossier →
                </button>
                <button
                  onClick={() => toggleTargetCompany(recruiter.company)}
                  className="btn btn-secondary"
                  style={{
                    borderRadius: '14px',
                    padding: '0.8rem 1rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    background: (session?.identity?.targetCompanies || []).includes(recruiter.company) ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-surface)',
                    borderColor: (session?.identity?.targetCompanies || []).includes(recruiter.company) ? 'var(--indigo)' : 'var(--border-default)',
                    color: (session?.identity?.targetCompanies || []).includes(recruiter.company) ? 'var(--indigo-light)' : 'var(--text-secondary)',
                  }}
                  title="Toggle target company tracking"
                >
                  {(session?.identity?.targetCompanies || []).includes(recruiter.company) ? '★ Target' : '☆ Track'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── PREPARATION PLAN MODAL ────────────────────────────────────── */}
      {selectedPlan && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 8, 14, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--indigo)',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            padding: '2.5rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-indigo">{selectedPlan.tier} Company</span>
                <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.3rem 0 0.15rem 0' }}>
                  {selectedPlan.company} Prep Dossier
                </h2>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  {selectedPlan.role} • Match: <strong style={{ color: '#10b981' }}>{selectedPlan.match}%</strong>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem' }}
              >
                ✕
              </button>
            </div>

            {/* Strategic Recommendation */}
            <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.1))', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--indigo-light)', textTransform: 'uppercase' }}>
                TARGET PREPARATION STRATEGY:
              </div>
              <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.3rem 0 0 0', lineHeight: 1.5 }}>
                "{selectedPlan.plan}"
              </p>
            </div>

            {/* Rounds Syllabus */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                📋 Selection Process & Rounds
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {selectedPlan.rounds.map((round, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--indigo-light)', fontWeight: 800 }}>R{idx + 1}:</span>
                    <span>{round}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Placement PYQs */}
            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                💡 Frequent Interview Coding Questions (PYQs)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedPlan.pyq.map((q, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', color: '#10b981', fontWeight: 600 }}>
                    <span>⚡</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setSelectedPlan(null); navigate('/roadmap'); }}
                className="btn btn-primary"
                style={{ flex: 1, borderRadius: '12px', padding: '0.8rem' }}
              >
                Add Tasks to Roadmap →
              </button>
              <button
                onClick={() => setSelectedPlan(null)}
                className="btn btn-secondary"
                style={{ borderRadius: '12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
