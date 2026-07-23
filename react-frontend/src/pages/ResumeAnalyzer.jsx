import React, { useRef, useState } from 'react';
import { useSession } from '../context/SessionContext';

const ResumeAnalyzer = () => {
  const { session, activeJobs, startNewAnalysis, resetSession, history } = useSession();
  
  // Navigation & Interactive States
  const [viewMode, setViewMode] = useState('landing'); 
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');

  const resumeInputRef = useRef(null);
  const uploadSectionRef = useRef(null);

  // Detect active AI job
  const analysisJob = Object.values(activeJobs).find(job => 
    job.type.includes('Resume') || job.type.includes('Roadmap') || job.type.includes('Gap')
  );

  const handleResumeSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setError('');
      try {
        await startNewAnalysis(file, jdText);
        setViewMode('upload_active');
      } catch (err) {
        console.error(err);
        setError('Analysis failed. Please check backend server.');
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // 7 Dark-Mode Flashcards matching user's exact attached screenshots
  const showcaseItems = [
    {
      id: 1,
      title: "AI Insights Providing for Improving Resume",
      subtitle: "Get intelligent suggestions for missing skills & keywords.",
      badge: "AI Insights",
      visualType: "insights"
    },
    {
      id: 2,
      title: "Context-Aware Chatbot Interface",
      subtitle: "Integrated chatbot with context-aware document Q&A.",
      badge: "Context Bot",
      visualType: "chatbot"
    },
    {
      id: 3,
      title: "Extracting and Previewing Text Content",
      subtitle: "Attach candidate resumes in PDF, DOCX, or TXT format.",
      badge: "Document Parser",
      visualType: "extraction"
    },
    {
      id: 4,
      title: "Skill Categorization & Match Count",
      subtitle: "Using spaCy & BERT NLP skill extraction engine.",
      badge: "{spaCy} BERT",
      visualType: "skills_spacy"
    },
    {
      id: 5,
      title: "Visualizations from Resume Analysis",
      subtitle: "Overall alignment score, keyword match & category charts.",
      badge: "Analytics Gauges",
      visualType: "visualizations"
    },
    {
      id: 6,
      title: "Report Generation From Result",
      subtitle: "Detailed, insightful & recruiter-grade decision making.",
      badge: "Report Generator",
      visualType: "report"
    },
    {
      id: 7,
      title: "Multi Resume Ranking Podium",
      subtitle: "After uploading multiple resumes for a job description.",
      badge: "Batch Screening",
      visualType: "podium"
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlideIndex(prev => (prev + 1) % showcaseItems.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex(prev => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  return (
    <div className="resume-analyzer-dark-container fade-in-up" style={{ width: '100%', maxWidth: '1420px', margin: '0 auto' }}>
      
      {/* Hidden File Input */}
      <input type="file" ref={resumeInputRef} style={{ display: 'none' }} onChange={handleResumeSelect} accept=".pdf,.docx,.txt" />

      {/* ========================================================================= */}
      {/* TOP HERO & 6 PROCESS STEP CARDS GRID                                      */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TOP HERO BANNER & 6 PROCESS STEP CARDS (MATCHING REFERENCE UI)            */}
      {/* ========================================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        borderRadius: '24px',
        padding: '2.5rem 3rem',
        boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.4)',
        marginBottom: '2.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.35fr', gap: '2.5rem', alignItems: 'center' }}>
          
          {/* LEFT HERO COLUMN */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.75rem',
              padding: '0.4rem 1.1rem',
              borderRadius: '999px',
              letterSpacing: '0.12em',
              marginBottom: '1.25rem',
              textTransform: 'uppercase'
            }}>
              RESUME ANALYZER
            </div>

            <h1 style={{ fontSize: '2.85rem', fontWeight: '900', lineHeight: '1.12', color: '#ffffff', margin: '0 0 1rem 0', letterSpacing: '-0.03em' }}>
              A smarter way to <br />
              screen resumes <br />
              and JDs
            </h1>

            <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.55', marginBottom: '1.85rem', maxWidth: '440px' }}>
              Analyze candidate resumes against job requirements with AI-powered alignment, skills highlights, and recruiter-ready insights.
            </p>

            <button 
              onClick={() => {
                if (viewMode === 'upload_active') {
                  uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  resumeInputRef.current?.click();
                }
              }}
              style={{
                background: '#ffffff',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              Start Analysis
            </button>
          </div>

          {/* RIGHT COLUMN: 6 PROCESS STEP CARDS (3x2 GRID) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            
            {/* Step 1 */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem 1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>1</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>Choose a domain</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Pick the target role domain that best fits the hiring need.</p>
            </div>

            {/* Step 2 */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem 1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>2</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>Upload JD details</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Upload a job description file or paste the text directly.</p>
            </div>

            {/* Step 3 */}
            <div onClick={() => resumeInputRef.current?.click()} style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem 1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>3</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>Add resume</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Attach a candidate resume in PDF, DOCX, or TXT format.</p>
            </div>

            {/* Step 4 */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem 1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>4</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>Run the analysis</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Start the AI match to reveal skills alignment and gaps.</p>
            </div>

            {/* Step 5 */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem 1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>5</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>Review results</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>See scorecards, missing capabilities, and evidence snapshots.</p>
            </div>

            {/* Step 6 */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem 1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>6</div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>Export report</h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>Download a polished PDF recruiter report from the sidebar.</p>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE UPLOAD & AUDIT WORKFLOW SECTION                               */}
      {/* ========================================================================= */}
      <div ref={uploadSectionRef} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1e2438' }}>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {analysisJob ? (
          <div style={{ background: '#131625', border: '1px solid #1e2438', borderRadius: '18px', padding: '4rem 2rem', textAlign: 'center' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--accent-primary)', width: '3rem', height: '3rem', margin: '0 auto 1.5rem' }}></div>
            <h3 style={{ color: '#ffffff' }}>AI Orchestrator: {analysisJob.type}</h3>
            <p style={{ color: '#94a3b8', margin: '1rem 0' }}>
              {analysisJob.progress < 30 ? 'Parsing document nodes...' : analysisJob.progress < 60 ? 'Analyzing ATS parameters...' : 'Synthesizing recommendations...'}
            </p>
            <div className="bar-container" style={{ maxWidth: '300px', margin: '0 auto' }}>
              <div className="bar-value" style={{ width: `${analysisJob.progress}%`, backgroundColor: 'var(--accent-primary)' }}></div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            
            {/* Left Column: Upload Dropzone & Audit Report */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Dropzone Card */}
              <div style={{ background: '#131625', border: '1px solid #1e2438', borderRadius: '18px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#ffffff' }}>Upload Candidate Resume</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '0.35rem' }}>
                    Target Job Description / Role:
                  </label>
                  <textarea 
                    placeholder="Paste job description or target role requirements..." 
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    style={{
                      width: '100%',
                      height: '80px',
                      background: '#0d0f17',
                      border: '1px solid #232a3e',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      resize: 'none'
                    }}
                  />
                </div>

                <div 
                  onClick={() => resumeInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(99, 102, 241, 0.4)',
                    borderRadius: '14px',
                    padding: '2.5rem 1.5rem',
                    background: '#0d0f17',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>📤</span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginTop: '0.4rem' }}>
                    {resumeFile ? resumeFile.name : 'Browse Resume or Drag & Drop File'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Supports PDF, DOCX, or TXT formats</span>
                </div>
              </div>

              {/* Audit Details */}
              {session && session.resumeAnalysis && (
                <div style={{ background: '#131625', border: '1px solid #1e2438', borderRadius: '18px', padding: '1.5rem' }}>
                  <div className="flex-between" style={{ borderBottom: '1px solid #1e2438', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>📄 Audit: {session.uploadedResume.filename}</h3>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Uploaded: {session.uploadedResume.uploadDate}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: getScoreColor(session.atsScore) }}>
                        {session.atsScore}%
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ATS Match</span>
                    </div>
                  </div>

                  {/* Extracted Skills */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', color: '#ffffff' }}>🛠️ Extracted Competencies</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {session.extractedSkills.map((s, idx) => (
                        <span key={idx} style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a855f7', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600' }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: History & Saved Sessions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: '#131625', border: '1px solid #1e2438', borderRadius: '18px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: '#ffffff' }}>🎯 Current Session Resume</h3>
                {session ? (
                  <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#10b981', display: 'block' }}>{session.uploadedResume.filename}</strong>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Uploaded {session.uploadedResume.uploadDate}</span>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No active resume uploaded in current session.</p>
                )}
              </div>

              <div style={{ background: '#131625', border: '1px solid #1e2438', borderRadius: '18px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: '#ffffff' }}>📅 Saved Session Records</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {history.length === 0 ? (
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>No saved records found.</p>
                  ) : (
                    history.map(item => (
                      <div key={item.id} className="flex-between" style={{ padding: '0.75rem', background: '#191d2d', border: '1px solid #23293a', borderRadius: '8px', fontSize: '0.82rem' }}>
                        <div>
                          <strong style={{ color: '#ffffff', display: 'block' }}>{item.filename}</strong>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{item.date}</span>
                        </div>
                        <div style={{ fontWeight: 'bold', color: getScoreColor(item.atsScore) }}>
                          {item.atsScore}% ATS
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Floating Robot AI Assistant Badge */}
      <div className="floating-ai-orb" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} title="AI Assistant">
        🤖
      </div>

    </div>
  );
};

export default ResumeAnalyzer;
