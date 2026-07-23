import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const DEFAULT_DEMO_SESSION = {
  sessionId: 'demo-session-001',
  placementReadiness: 84,
  atsScore: 84,
  resumeName: 'Shiva_Reddy_SoftwareEngineer_Resume.pdf',
  extractedSkills: [
    'React', 'JavaScript', 'Node.js', 'Python', 'FastAPI',
    'SQL', 'Git', 'REST APIs', 'HTML5/CSS3', 'Data Structures',
    'Algorithms', 'Tailwind CSS', 'Redux Toolkit', 'MongoDB', 'Docker'
  ],
  matchingSkills: ['React', 'JavaScript', 'Node.js', 'Python', 'FastAPI', 'REST APIs', 'Git', 'HTML5/CSS3'],
  missingSkills: ['System Design & Scalability', 'Docker & Kubernetes', 'PostgreSQL Query Tuning', 'Redis Caching', 'GraphQL APIs'],
  recommendations: [
    'Highlight full-stack project architecture and API performance metrics.',
    'Add Docker containerization experience to strengthen DevOps matching.',
    'Include System Design patterns (Caching, Load Balancing, Database Sharding) for target roles.'
  ],
  jobMatches: [
    {
      id: 'job-1',
      role: 'Full Stack Software Engineer',
      company: 'Infosys / Tech Target',
      logo: '⚡',
      matchPercent: 86,
      scoreColor: '#10b981',
      matchingSkills: ['React', 'JavaScript', 'Node.js', 'Python', 'REST APIs', 'Git'],
      missingSkills: ['Docker & Kubernetes', 'System Design'],
      matchingKeywordsCount: 14,
      missingKeywordsCount: 3,
      salaryRange: '$85,000 - $110,000 /yr',
      location: 'Hybrid / Bangalore, IN',
      summary: 'High compatibility match with candidate frontend & backend experience.'
    },
    {
      id: 'job-2',
      role: 'Frontend UI/UX Engineer',
      company: 'Google Cloud Platform',
      logo: '🌐',
      matchPercent: 91,
      scoreColor: '#10b981',
      matchingSkills: ['React', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS', 'Redux Toolkit', 'REST APIs'],
      missingSkills: ['TypeScript Strict Mode', 'Webpack/Vite Tuning'],
      matchingKeywordsCount: 18,
      missingKeywordsCount: 2,
      salaryRange: '$120,000 - $150,000 /yr',
      location: 'Remote',
      summary: 'Exceptional UI/UX & React framework alignment.'
    },
    {
      id: 'job-3',
      role: 'Backend API Developer',
      company: 'Amazon Web Services',
      logo: '📦',
      matchPercent: 78,
      scoreColor: '#3b82f6',
      matchingSkills: ['Python', 'FastAPI', 'Node.js', 'SQL', 'MongoDB'],
      missingSkills: ['Redis Caching', 'PostgreSQL Query Tuning', 'AWS Lambda'],
      matchingKeywordsCount: 12,
      missingKeywordsCount: 5,
      salaryRange: '$110,000 - $140,000 /yr',
      location: 'Hybrid / Hyderabad, IN',
      summary: 'Solid Python & REST API foundation; minor cloud & caching gaps.'
    }
  ],
  skillGaps: [
    {
      skill: 'System Design & Scalability',
      priority: 'Critical',
      interviewFreq: 'Very High',
      status: 'In Progress',
      topics: ['Load Balancers & API Gateways', 'Database Sharding', 'Redis Caching Strategies', 'Microservices Architecture'],
      resources: ['System Design Primer Guide', 'High Scalability Real-world Architectures']
    },
    {
      skill: 'Docker & Kubernetes',
      priority: 'High',
      interviewFreq: 'High',
      status: 'Locked',
      topics: ['Dockerfile Optimization', 'Multi-stage Builds', 'Docker Compose Networking', 'K8s Pod Management'],
      resources: ['Docker Basics for Engineers', 'Kubernetes Deployment Handbook']
    },
    {
      skill: 'PostgreSQL Query Tuning',
      priority: 'High',
      interviewFreq: 'High',
      status: 'Locked',
      topics: ['B-Tree vs Hash Indexes', 'EXPLAIN ANALYZE Execution Plans', 'Connection Pooling (PgBouncer)', 'N+1 Query Fixing'],
      resources: ['Postgres Performance Essentials', 'SQL Optimization Cheat Sheet']
    },
    {
      skill: 'Redis Caching Patterns',
      priority: 'Medium',
      interviewFreq: 'Medium',
      status: 'Locked',
      topics: ['Cache-Aside Pattern', 'Write-Through Caching', 'TTL & Eviction Policies (LRU)', 'Redis Data Types'],
      resources: ['Redis In-Memory Data Store Guide', 'Caching Best Practices']
    }
  ],
  learningRoadmap: {
    duration: '4 Weeks',
    targetRole: 'Full Stack Software Engineer',
    roadmapProgress: 35,
    weeks: [
      {
        week: 1,
        title: 'Week 1: System Design & High-Scale Architecture',
        focus: 'Master client-server, load balancers, caching, and database partitioning.',
        tasks: [
          { id: 't1', name: 'Study Client-Server vs Microservices Architecture', done: true },
          { id: 't2', name: 'Understand Redis Caching Strategies (Cache-Aside, Write-Through)', done: true },
          { id: 't3', name: 'Design a scalable URL Shortener system (TinyURL architecture)', done: false }
        ]
      },
      {
        week: 2,
        title: 'Week 2: DevOps, Docker & Containerization',
        focus: 'Learn Dockerfiles, Docker Compose multi-container stacks, and GitHub Actions CI/CD.',
        tasks: [
          { id: 't4', name: 'Containerize a React + FastAPI + Postgres stack using Docker Compose', done: false },
          { id: 't5', name: 'Write GitHub Actions workflow for automated testing & Vercel deployment', done: false }
        ]
      },
      {
        week: 3,
        title: 'Week 3: Advanced Database Systems & Performance',
        focus: 'Master PostgreSQL B-Tree indexing, execution plans, and ORM query optimization.',
        tasks: [
          { id: 't6', name: 'Identify and resolve N+1 query performance bottlenecks in backend ORMs', done: false },
          { id: 't7', name: 'Implement database indexing benchmark tests with EXPLAIN ANALYZE', done: false }
        ]
      },
      {
        week: 4,
        title: 'Week 4: AI Mock Interviews & Capstone Portfolio',
        focus: 'Practice technical coding rounds, behavioral STAR responses, and project showcases.',
        tasks: [
          { id: 't8', name: 'Complete 3 AI Mock Interview rounds with PlaceAI Coach', done: false },
          { id: 't9', name: 'Polish GitHub repositories & publish live project demo link', done: false }
        ]
      }
    ]
  }
};

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  // 1. User Profile state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('placeai_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Shiva Reddy',
      email: 'shiva.reddy@placeai.co',
      targetCompany: 'Google',
      preferredRole: 'Software Engineer',
      preferredLanguage: 'JavaScript',
      theme: 'light',
      notificationsEnabled: true
    };
  });

  // 2. Active Session state (defaults to DEFAULT_DEMO_SESSION)
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('placeai_session');
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_SESSION;
  });

  // 3. Active Running Jobs
  const [activeJobs, setActiveJobs] = useState({});

  // 4. AI Dynamic Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to PlaceAI! Upload your resume to start.', time: 'Just now', read: false }
  ]);

  // 5. Saved History
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('placeai_history');
    return saved ? JSON.parse(saved) : [];
  });

  // 6. Toasts state
  const [toasts, setToasts] = useState([]);

  // Initialize/retrieve backend session on mount
  useEffect(() => {
    const initSession = async () => {
      let sessId = localStorage.getItem('session_id');
      if (!sessId) {
        try {
          const res = await api.createSession();
          sessId = res.data.session_id;
          localStorage.setItem('session_id', sessId);
          console.log("Initialized new session:", sessId);
        } catch (err) {
          console.error("Failed to initialize session:", err);
        }
      }
      
      if (sessId) {
        try {
          const res = await api.getSessionDetails(sessId);
          if (res.data && res.data.resume) {
            const missing = res.data.match?.missing_skills || [];
            const extracted = res.data.resume.extracted_skills || [];
            const structuredGaps = missing.map((skillName, index) => {
              let priority = 'Medium';
              let freq = 'High';
              let topics = ['Fundamentals', 'Best Practices', 'Common Interview Patterns'];
              const lowerSkill = skillName.toLowerCase();
              if (lowerSkill.includes('docker') || lowerSkill.includes('kubernetes') || lowerSkill.includes('container')) {
                priority = 'Critical';
                freq = 'Very High';
                topics = ['Images & Containers', 'Docker Compose', 'Multi-stage Builds', 'Networking'];
              } else if (lowerSkill.includes('api') || lowerSkill.includes('rest') || lowerSkill.includes('fastapi')) {
                priority = 'High';
                freq = 'High';
                topics = ['HTTP Status Codes', 'Request Validation (Pydantic)', 'Database Integration', 'Rate Limiting'];
              } else if (lowerSkill.includes('sql') || lowerSkill.includes('postgres') || lowerSkill.includes('db')) {
                priority = 'Critical';
                freq = 'Very High';
                topics = ['Indexes & Performance', 'Joins & Subqueries', 'Migrations (Alembic)', 'Transactions'];
              }
              return {
                skill: skillName,
                priority,
                interviewFreq: freq,
                status: index === 0 ? 'In Progress' : 'Locked',
                topics,
                resources: [`Learn ${skillName} official tutorials`, `${skillName} Interview Guide`]
              };
            });

            const augmentedMatch = res.data.match ? {
              ...res.data.match,
              id: res.data.match.id,
              company: res.data.job?.company || 'Target Company',
              role: res.data.job?.title || 'Software Engineer',
              logo: '⚡',
              matchPercent: res.data.match.match_percentage,
              matchedSkills: extracted.filter(s => !missing.map(m => m.toLowerCase()).includes(s.toLowerCase())),
              missingSkills: missing
            } : null;

            setSession({
              sessionId: sessId,
              uploadedResume: {
                filename: res.data.resume.filename || "Uploaded Resume",
                uploadDate: new Date(res.data.resume.created_at).toLocaleDateString('en-GB')
              },
              sessionStatus: 'Completed',
              atsScore: res.data.resume.ats_score,
              placementReadiness: res.data.match ? Math.round((res.data.resume.ats_score + res.data.match.match_percentage) / 2) : Math.round(res.data.resume.ats_score * 0.9),
              extractedSkills: extracted,
              resumeAnalysis: res.data.resume,
              jobMatches: augmentedMatch ? [augmentedMatch] : [],
              skillGaps: structuredGaps,
              learningRoadmap: res.data.roadmap,
              interviewQuestions: res.data.interview?.qna_records || [],
              interviewResults: res.data.interview,
              aiRecommendations: res.data.resume.improvements || [],
              timeline: [{ time: 'Just now', event: 'Session loaded from database' }]
            });
          } else {
            // Backend has no active analysis record for this session ID
            setSession(null);
          }
        } catch (err) {
          console.error("Failed to sync session details from backend:", err);
        }
      }
    };
    initSession();
  }, []);

  // Persist Profile changes
  useEffect(() => {
    localStorage.setItem('placeai_profile', JSON.stringify(profile));
  }, [profile]);

  // Persist Session changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('placeai_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('placeai_session');
    }
  }, [session]);

  // Persist History changes
  useEffect(() => {
    localStorage.setItem('placeai_history', JSON.stringify(history));
  }, [history]);

  // Toast helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Add Dynamic Notification
  const addNotification = (text) => {
    setNotifications(prev => [
      { id: Date.now(), text, time: 'Just now', read: false },
      ...prev
    ]);
  };

  // Run Job Helper (Simulates async processing with state updates)
  const runJob = async (jobType, durationMs, processingCallback, successCallback, errorCallback) => {
    const jobId = `${jobType}-${Date.now()}`;
    setActiveJobs(prev => ({ ...prev, [jobId]: { type: jobType, status: 'Processing', progress: 0 } }));
    
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, durationMs / steps));
      setActiveJobs(prev => {
        if (!prev[jobId]) return prev;
        return {
          ...prev,
          [jobId]: { ...prev[jobId], progress: Math.min(100, i * 20) }
        };
      });
      if (processingCallback) processingCallback(i * 20);
    }

    try {
      const result = await successCallback();
      setActiveJobs(prev => {
        const copy = { ...prev };
        delete copy[jobId];
        return copy;
      });
      showToast(`${jobType} completed successfully`, 'success');
      return result;
    } catch (err) {
      setActiveJobs(prev => {
        const copy = { ...prev };
        delete copy[jobId];
        return copy;
      });
      showToast(`${jobType} failed! Please retry.`, 'error');
      if (errorCallback) errorCallback(err);
      throw err;
    }
  };

  // Start New Analysis (Create fresh session on backend)
  const startNewAnalysis = async (file, jobDescription = "") => {
    const sessId = localStorage.getItem('session_id') || `sess-${Date.now()}`;
    setSession({
      sessionId: sessId,
      uploadedResume: {
        filename: file.name,
        uploadDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      },
      sessionStatus: 'Processing',
      atsScore: 0,
      placementReadiness: 0,
      extractedSkills: [],
      resumeAnalysis: null,
      jobMatches: [],
      skillGaps: [],
      learningRoadmap: null,
      interviewQuestions: [],
      interviewResults: null,
      aiRecommendations: [],
      timeline: [{ time: 'Just now', event: 'Resume Uploaded' }]
    });

    try {
      // 1. Resume Parsing & ATS
      let resumeId = null;
      let resumeData = null;
      await runJob('Resume Analysis', 3000, null, async () => {
        const res = await api.uploadResume(file);
        resumeId = res.data.id;
        resumeData = res.data;
        setSession(prev => ({
          ...prev,
          atsScore: res.data.ats_score,
          extractedSkills: res.data.extracted_skills || [],
          aiRecommendations: res.data.improvements || [],
          resumeAnalysis: res.data,
          timeline: [...prev.timeline, { time: 'Just now', event: 'Resume ATS Analysis Completed' }]
        }));
      });

      let jobId = null;
      let jobData = null;
      // 2. Job Analysis (if job text is provided)
      if (jobDescription.trim()) {
        await runJob('Job Description Analysis', 2000, null, async () => {
          const res = await api.analyzeJob("Target Role", "Target Company", jobDescription);
          jobId = res.data.id;
          jobData = res.data;
          setSession(prev => ({
            ...prev,
            timeline: [...prev.timeline, { time: 'Just now', event: 'Job Requirements Extracted' }]
          }));
        });
      }

      // 3. Skill Gap & Job Compatibility Computation
      if (resumeId) {
        await runJob('Skill Gap & Job Analysis', 2000, null, async () => {
          let matchResData = null;
          if (jobId) {
            const matchRes = await api.runMatch(resumeId, jobId);
            matchResData = matchRes.data;
          }
          
          const gapsRes = await api.getSkillGaps();
          const missing = gapsRes.data.missing_skills || ['Docker & Containers', 'REST API Architecture', 'SQL Optimization'];
          
          const structuredGaps = missing.map((skillName, index) => {
            let priority = 'Medium';
            let freq = 'High';
            let topics = ['Fundamentals', 'Best Practices', 'Common Interview Patterns'];
            const lowerSkill = skillName.toLowerCase();
            if (lowerSkill.includes('docker') || lowerSkill.includes('kubernetes') || lowerSkill.includes('container')) {
              priority = 'Critical';
              freq = 'Very High';
              topics = ['Images & Containers', 'Docker Compose', 'Multi-stage Builds', 'Networking'];
            } else if (lowerSkill.includes('api') || lowerSkill.includes('rest') || lowerSkill.includes('fastapi')) {
              priority = 'High';
              freq = 'High';
              topics = ['HTTP Status Codes', 'Request Validation (Pydantic)', 'Database Integration', 'Rate Limiting'];
            } else if (lowerSkill.includes('sql') || lowerSkill.includes('postgres') || lowerSkill.includes('db')) {
              priority = 'Critical';
              freq = 'Very High';
              topics = ['Indexes & Performance', 'Joins & Subqueries', 'Migrations (Alembic)', 'Transactions'];
            } else if (lowerSkill.includes('system') || lowerSkill.includes('design')) {
              priority = 'Critical';
              freq = 'Very High';
              topics = ['Scalability', 'Load Balancing', 'Caching Strategies', 'Database Sharding'];
            }
            return {
              skill: skillName,
              priority,
              interviewFreq: freq,
              status: index === 0 ? 'In Progress' : 'Locked',
              topics,
              resources: [`Learn ${skillName} official tutorials`, `${skillName} Interview Guide`]
            };
          });

          setSession(prev => {
            let matches = prev.jobMatches;
            let matchPct = 78;
            if (matchResData) {
              matchPct = matchResData.match_percentage;
              const augmentedMatch = {
                ...matchResData,
                id: matchResData.id,
                company: jobData?.company || 'Target Company',
                role: jobData?.title || 'Software Engineer',
                logo: '⚡',
                matchPercent: matchResData.match_percentage,
                missingSkills: missing,
                matchedSkills: (prev.extractedSkills || []).filter(s => !missing.map(m => m.toLowerCase()).includes(s.toLowerCase()))
              };
              matches = [augmentedMatch];
            }

            return {
              ...prev,
              jobMatches: matches,
              skillGaps: structuredGaps,
              placementReadiness: Math.round((prev.atsScore + matchPct) / 2),
              timeline: [...prev.timeline, { time: 'Just now', event: 'Skill Gaps & Industry Benchmark Computed' }]
            };
          });
        });
      }

      // 4. Learning Roadmap
      if (resumeId) {
        await runJob('Learning Roadmap Generation', 2500, null, async () => {
          const role = jobData?.title || 'Software Engineer';
          const roadRes = await api.generateRoadmap(role, jobId || null);
          
          setSession(prev => ({
            ...prev,
            learningRoadmap: roadRes.data,
            sessionStatus: 'Completed',
            timeline: [...prev.timeline, { time: 'Just now', event: 'Personalized Roadmap Created' }]
          }));
        });
      }
      
      addNotification(`Resume parsed! ATS score index reached ${resumeData?.ats_score}%.`);

    } catch (err) {
      console.error(err);
      setSession(prev => prev ? { ...prev, sessionStatus: 'Failed' } : null);
      showToast('AI analysis flow failed', 'error');
    }
  };

  // Save Session to History
  const saveSessionToHistory = () => {
    if (!session) return;
    const historyRecord = {
      id: `hist-${Date.now()}`,
      filename: session.uploadedResume.filename,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      atsScore: session.atsScore,
      placementReadiness: session.placementReadiness,
      jobMatchesCount: session.jobMatches.length,
      topJobMatch: session.jobMatches[0] ? `${session.jobMatches[0].company || 'Target'} (${session.jobMatches[0].match_percentage}%)` : 'N/A',
      skillGapsCount: session.skillGaps.length,
      interviewScore: session.interviewResults ? session.interviewResults.overall_score : null
    };

    setHistory(prev => [historyRecord, ...prev]);
    showToast('Placement analysis saved to history', 'success');
    addNotification(`Analysis for ${session.uploadedResume.filename} has been saved to history.`);
  };

  // Reset/Clear active session
  const resetSession = async () => {
    const sessId = localStorage.getItem('session_id');
    if (sessId) {
      try {
        await api.deleteSession(sessId);
      } catch (err) {
        console.error(err);
      }
    }
    
    localStorage.removeItem('session_id');
    localStorage.removeItem('placeai_session');
    setSession(null);

    try {
      const res = await api.createSession();
      localStorage.setItem('session_id', res.data.session_id);
    } catch (err) {
      console.error(err);
    }

    showToast('Current session cleared and reset', 'info');
  };

  // Delete specific history record
  const deleteHistoryRecord = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    showToast('History record deleted', 'info');
  };

  return (
    <SessionContext.Provider value={{
      profile,
      setProfile,
      session,
      setSession,
      activeJobs,
      notifications,
      setNotifications,
      history,
      toasts,
      showToast,
      startNewAnalysis,
      saveSessionToHistory,
      resetSession,
      deleteHistoryRecord
    }}>
      {children}
      
      {/* Visual Toast Alerts Manager */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} style={{
            background: t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#3b82f6',
            color: '#ffffff',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✗ ' : 'ℹ '}
            {t.message}
          </div>
        ))}
      </div>
    </SessionContext.Provider>
  );
};

