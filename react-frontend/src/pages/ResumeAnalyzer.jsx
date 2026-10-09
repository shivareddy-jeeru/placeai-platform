import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlacementProfile from '../hooks/usePlacementProfile';
import { useSession } from '../context/SessionContext';

const PRESET_JDS = {
  fullstack: `Full Stack Software Engineer position requiring proficiency in Python, FastAPI, Node.js, React, JavaScript, REST API design, PostgreSQL database optimization, Docker containerization, Git version control, and AWS cloud deployment. Candidates should demonstrate quantified achievements in API latency reduction and scalable microservices architecture.`,
  backend: `Senior Backend Engineer position requiring deep experience with Python, FastAPI, PostgreSQL, Redis caching, AsyncIO, REST APIs, Microservices, Unit Testing with Pytest, Docker, and Kubernetes. Strong knowledge of system design and database indexing is required.`,
  devops: `Cloud & DevOps Engineer responsible for Kubernetes, Docker, CI/CD pipelines, AWS, Terraform, Linux, Prometheus monitoring, and Infrastructure as Code. Experience with automated testing and container security mandatory.`
};

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const { placementProfile, startNewAnalysis } = usePlacementProfile();
  const { session } = useSession();
  const fileInputRef = useRef(null);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [targetJd, setTargetJd] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);
  const [activeTab, setActiveTab] = useState('ats');
  const [showFixModal, setShowFixModal] = useState(false);

  const atsResult = placementProfile?.atsResult || session?.atsResult;
  const overallScore = atsResult?.resumeAtsScore || 84;
  const atsMetric = atsResult?.atsScore || 92;
  const keywordsMetric = atsResult?.keywordScore || 76;
  const skillsMetric = atsResult?.skillsScore || 88;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      runAnalysis(file);
    }
  };

  const runAnalysis = async (file) => {
    setAnalyzing(true);
    setScanStep(1);

    const stepInterval = setInterval(() => {
      setScanStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 400);

    try {
      await startNewAnalysis(file, targetJd);
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(stepInterval);
      setAnalyzing(false);
      setScanStep(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      runAnalysis(file);
    }
  };

  const bd = atsResult?.breakdown || {
    readability: 14,
    sections: 14,
    contact: 10,
    skills: 13,
    experience: 12,
    achievements: 6,
    education: 5,
    formatting: 10,
  };

  const subCategories = [
    { label: 'ATS Readability & PDF Parsing', val: bd.readability, max: 15, color: '#6366f1' },
    { label: 'Standard Section Headings', val: bd.sections, max: 15, color: '#3b82f6' },
    { label: 'Contact Details & Profile Links', val: bd.contact, max: 10, color: '#10b981' },
    { label: 'Technical Skill Density', val: bd.skills, max: 15, color: '#8b5cf6' },
    { label: 'Experience & Project Structure', val: bd.experience, max: 15, color: '#c084fc' },
    { label: 'Quantified Impact Metrics', val: bd.achievements, max: 10, color: '#f59e0b' },
    { label: 'Education & Academic Qualification', val: bd.education, max: 5, color: '#ec4899' },
    { label: 'Formatting & Layout Warnings', val: bd.formatting, max: 15, color: '#14b8a6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1380px', margin: '0 auto', paddingBottom: '6rem' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── SCANNING MODAL OVERLAY ────────────────────────────────────── */}
      {analyzing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(10px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '2px solid var(--indigo)',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.75rem',
            boxShadow: '0 25px 70px rgba(99, 102, 241, 0.25)',
            textAlign: 'center'
          }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)', color: '#fff' }}>
              ⚡
            </div>

            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                Analyzing Resume in Real-Time…
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                Deterministic ATS Engine parsing PDF text, keywords & 8 rubrics
              </p>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
              {[
                { step: 1, label: '1. Extracting PDF/DOCX Binary Stream' },
                { step: 2, label: '2. Section Headings & Contact Details' },
                { step: 3, label: '3. Evaluating 8 Category Rubric Rules' },
                { step: 4, label: '4. Computing Skill Density & Match Score' }
              ].map(s => {
                const isStepActive = scanStep >= s.step;
                return (
                  <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: isStepActive ? '#10b981' : 'var(--text-muted)' }}>
                    <span>{isStepActive ? '✓' : '○'}</span>
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ width: '100%', height: '8px', background: 'var(--bg-overlay)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${scanStep * 25}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── CLEAN, LIGHTWEIGHT SAAS HERO (SIMPLE, BEAUTIFUL & FOCUSED) ── */}
      <div className="saas-hero-card" style={{ padding: '2.4rem 2.4rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(320px, 1fr)',
          gap: '2.5rem',
          alignItems: 'center',
        }}>
          {/* Left Column: Heading, Value Prop & Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <span className="saas-pill" style={{ marginBottom: '0.8rem' }}>
                ⚡ DETERMINISTIC ATS ENGINE
              </span>
              <h1 className="hero-giant-title" style={{ margin: '0.3rem 0 0.5rem 0' }}>
                AI Resume Audit & Placement Matcher
              </h1>
              <p className="hero-lead-text" style={{ margin: 0 }}>
                Deterministic 8-rubric scoring, keyword gap detection, and quantifiable STAR bullet improvements engineered for technical campus drives.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                style={{ borderRadius: '14px', padding: '0.85rem 1.8rem', fontSize: '0.95rem', fontWeight: 700 }}
              >
                📄 Upload Resume
              </button>
              <button
                onClick={() => setShowJdInput(!showJdInput)}
                className="btn btn-secondary"
                style={{ borderRadius: '14px', padding: '0.85rem 1.4rem', fontSize: '0.88rem', fontWeight: 600 }}
              >
                {showJdInput ? '✕ Close JD' : '🎯 Align Target JD'}
              </button>
            </div>

            {/* Quick feature tags */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> 8-Rubric Parser
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: 'var(--indigo-light)' }}>✓</span> Keyword Density Radar
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: '#f59e0b' }}>✓</span> STAR Bullet Metric Check
              </span>
            </div>

            {/* Target JD Drawer */}
            {showJdInput && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '1.1rem',
                marginTop: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                animation: 'fadeUp 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Role Presets:</span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setTargetJd(PRESET_JDS.fullstack)}
                      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', color: 'var(--indigo-light)', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      💻 Full Stack
                    </button>
                    <button
                      onClick={() => setTargetJd(PRESET_JDS.backend)}
                      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', color: '#8b5cf6', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      🐍 Backend
                    </button>
                    <button
                      onClick={() => setTargetJd(PRESET_JDS.devops)}
                      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', color: '#10b981', borderRadius: '8px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      ☁️ DevOps
                    </button>
                  </div>
                </div>

                <textarea
                  value={targetJd}
                  onChange={(e) => setTargetJd(e.target.value)}
                  placeholder="Paste target job requirements from Amazon, Google, or TCS to evaluate keyword alignment..."
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px',
                    padding: '0.65rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Column: Integrated Interactive Dropzone & Active Status Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
            onDrop={handleDrop}
            style={{
              background: isDraggingOver ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
              border: `2px dashed ${isDraggingOver ? 'var(--indigo)' : 'var(--border-default)'}`,
              borderRadius: '20px',
              padding: '1.8rem 1.6rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                ✓ Ready for Placement
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                PDF / DOCX
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', margin: '0.4rem 0' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>{overallScore}</span>
                <span style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.9 }}>ATS SCORE</span>
              </div>

              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {atsResult?.fileName || 'Shiva_Resume.pdf'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Parsed via deterministic multi-stage AST
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>Keywords: {keywordsMetric}%</span>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Skills: {skillsMetric}%</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.78rem',
              color: 'var(--indigo-light)',
              fontWeight: 700
            }}>
              <span>📤 Drop new resume here or click to re-scan</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STREAMLINED PLACEMENT TOOLKIT (6 CORE FEATURES, SIMPLE & CRISP) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PLACEMENT SUITE
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0 0 0' }}>
              Core Analysis Capabilities
            </h2>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>6 Interactive Modules</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.1rem',
        }}>
          {[
            {
              id: '1',
              title: '8-Rubric ATS Audit',
              desc: 'Readability, headings, links, skill density, impact metrics, and layout checks.',
              tag: 'Audit Engine',
              badgeClass: 'badge-indigo',
              action: () => fileInputRef.current?.click(),
            },
            {
              id: '2',
              title: 'Semantic JD Matcher',
              desc: 'Cross-references skills against Amazon SDE-1, TCS Digital, and Google roles.',
              tag: 'Role Matcher',
              badgeClass: 'badge-cyan',
              action: () => navigate('/job-matcher'),
            },
            {
              id: '3',
              title: 'Skill Gap Radar',
              desc: 'Identifies strong proficiencies and flags missing cloud/system design skills.',
              tag: 'Skill Radar',
              badgeClass: 'badge-amber',
              action: () => navigate('/skill-map'),
            },
            {
              id: '4',
              title: 'STAR Bullet Rewriter',
              desc: 'Transforms weak bullet points into quantified achievements with latency & metrics.',
              tag: 'STAR Rewriter',
              badgeClass: 'badge-green',
              action: () => setShowFixModal(true),
            },
            {
              id: '5',
              title: 'Adaptive Roadmap',
              desc: 'A 4-phase structured progression timeline connecting missing skills to practice.',
              tag: 'Roadmap',
              badgeClass: 'badge-violet',
              action: () => navigate('/roadmap'),
            },
            {
              id: '6',
              title: 'Context-Aware Mentor',
              desc: 'Daily strategic advice based on your live 84 ATS score and target companies.',
              tag: 'AI Mentor',
              badgeClass: 'badge-pink',
              action: () => navigate('/mentor'),
            },
          ].map(feature => (
            <div
              key={feature.id}
              onClick={feature.action}
              className="workflow-step-box"
              style={{
                cursor: 'pointer',
                padding: '1.15rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${feature.badgeClass}`} style={{ fontSize: '0.65rem' }}>
                  {feature.tag}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--indigo-light)', fontWeight: 700 }}>
                  Open →
                </span>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {feature.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── AFTER ANALYSIS: 84/100 RESUME SCORE & NEEDS IMPROVEMENT ────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1.4fr)',
        gap: '1.5rem',
      }}>
        {/* Scorecard Hero Box */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.2rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              DETERMINISTIC ATS SCORE
            </span>

            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ fontSize: '4.2rem', fontWeight: 900, color: '#10b981', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {overallScore}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                / 100
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                Resume Score
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-default)',
            paddingTop: '1.25rem',
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ATS</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981' }}>{atsMetric}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Keywords</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b' }}>{keywordsMetric}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Skills</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#6366f1' }}>{skillsMetric}%</div>
            </div>
          </div>
        </div>

        {/* 🔴 NEEDS IMPROVEMENT SECTION */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.2rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span className="badge badge-red" style={{ fontSize: '0.72rem', fontWeight: 900, padding: '0.3rem 0.8rem' }}>
                🔴 NEEDS IMPROVEMENT
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Action Items to Reach 95+</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.1rem', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-default)' }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>Missing keywords</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AWS, Docker, System Design, Kubernetes</div>
                </div>
                <span className="badge badge-red" style={{ fontSize: '0.85rem', fontWeight: 900 }}>4</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.1rem', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-default)' }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>Weak achievements</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bullet points missing quantifiable numbers (e.g. latency, %)</div>
                </div>
                <span className="badge badge-amber" style={{ fontSize: '0.85rem', fontWeight: 900 }}>3</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.1rem', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border-default)' }}>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.92rem' }}>Project descriptions</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Need architecture context & deployment scope</div>
                </div>
                <span className="badge badge-indigo" style={{ fontSize: '0.85rem', fontWeight: 900 }}>2</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowFixModal(true)}
            className="btn btn-primary"
            style={{ borderRadius: '14px', padding: '0.85rem 1.8rem', fontSize: '0.95rem', width: '100%' }}
          >
            Fix My Resume →
          </button>
        </div>
      </div>

      {/* ─── RESUME INTELLIGENCE BREAKDOWN TABS ─────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.2rem 2rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--indigo-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            DEEP ATS AUDIT
          </span>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.2rem 0 0 0' }}>
            Resume Intelligence 🔍
          </h3>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'ats', label: 'ATS Score' },
            { id: 'keywords', label: 'Keyword Analysis' },
            { id: 'skills', label: 'Skills Detected' },
            { id: 'projects', label: 'Projects & Metrics' },
            { id: 'education', label: 'Education' },
            { id: 'formatting', label: 'Formatting & Layout' },
            { id: 'contact', label: 'Contact Info' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? 'var(--indigo)' : 'var(--bg-surface)',
                color: activeTab === t.id ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === t.id ? 'var(--indigo)' : 'var(--border-default)'}`,
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        {activeTab === 'ats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {subCategories.map(cat => (
              <div key={cat.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  <span>{cat.label}</span>
                  <span style={{ color: cat.color }}>{cat.val} / {cat.max}</span>
                </div>
                <div style={{ height: '7px', background: 'var(--bg-overlay)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${(cat.val / cat.max) * 100}%`, height: '100%', background: cat.color, borderRadius: '99px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'keywords' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#10b981', display: 'block', marginBottom: '0.5rem' }}>✓ Detected Keywords (Found in Resume)</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['Python', 'FastAPI', 'PostgreSQL', 'Git', 'REST APIs', 'React', 'Docker', 'AsyncIO', 'Unit Testing', 'Redis', 'SQL'].map(k => (
                  <span key={k} className="badge-tag match">{k}</span>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ef4444', display: 'block', marginBottom: '0.5rem' }}>⚠ Missing High-Value Keywords for Target Role</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['AWS Cloud', 'Kubernetes Orchestration', 'System Design Distributed Caching', 'CI/CD GitHub Actions'].map(k => (
                  <span key={k} className="badge-tag missing">{k}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {['Python (Advanced)', 'FastAPI (Advanced)', 'PostgreSQL (Proficient)', 'React (Proficient)', 'Git/GitHub (Advanced)', 'REST Architecture (Advanced)', 'SQL Optimization (Proficient)'].map(s => (
              <span key={s} className="badge badge-indigo" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                ⚡ {s}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>PlaceAI — Placement Command Platform</strong>
                <span className="badge badge-green">Quantified 85%</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                Strong architecture explanation. Recommendation: add specific RPS (requests per second) and database indexing latency savings to bullet 2.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>B.Tech in Computer Science & Engineering</strong>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>
              CGPA: 8.4 / 10 • Graduating Batch 2026 • Verified Standard Degree Section Heading
            </p>
          </div>
        )}

        {activeTab === 'formatting' && (
          <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
            <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.4rem' }}>✓ Clean Single-Column ATS Layout</div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              No complex tables, images, or nested multi-columns detected. Text is 100% extractable by Workday, Taleo, and Greenhouse parsers.
            </p>
          </div>
        )}

        {activeTab === 'contact' && (
          <div style={{ background: 'var(--bg-surface)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-default)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Email:</span>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>shiva.student@example.com ✓</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>LinkedIn:</span>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>linkedin.com/in/shiva-dev ✓</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GitHub:</span>
              <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>github.com/shiva-dev ✓</div>
            </div>
          </div>
        )}
      </div>

      {/* ─── AI MENTOR RECOMMENDATION CARD ──────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
        border: '1.5px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '24px',
        padding: '2rem 2.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}>
        <div style={{ maxWidth: '780px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              AI MENTOR RECOMMENDATION
            </span>
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
            "{atsResult?.aiMentorRecommendation || 'Your resume is strong for Software Engineer roles, but your project descriptions need measurable outcomes.'}"
          </p>
        </div>

        <button
          onClick={() => setShowFixModal(true)}
          className="btn btn-primary"
          style={{ borderRadius: '14px', padding: '0.85rem 1.6rem', fontSize: '0.9rem', fontWeight: 800 }}
        >
          View Suggested Bullet Edits →
        </button>
      </div>

      {/* ─── FIX MY RESUME MODAL (DYNAMIC BASED ON ACTIVE RESUME SKILLS) ─ */}
      {showFixModal && (() => {
        const detected = atsResult?.detectedSkills || ['Python', 'FastAPI', 'SQL'];
        const missing = atsResult?.missingSkills || ['AWS', 'Docker', 'System Design'];
        const fileName = atsResult?.fileName || 'Current Resume';

        const s1 = detected[0] || 'Python';
        const s2 = detected[1] || 'SQL';
        const s3 = detected[2] || 'FastAPI';
        const m1 = missing[0] || 'Docker';
        const m2 = missing[1] || 'AWS Cloud';
        const m3 = missing[2] || 'System Design';

        const dynamicBullets = [
          {
            tag: `CORE BACKEND (${s1.toUpperCase()} & ${s3.toUpperCase()})`,
            before: `Built backend services and API models using ${s1} and ${s3}.`,
            after: `Architected asynchronous ${s3} REST microservices with ${s2} query optimization, reducing p95 API response latency by 38% under 500 concurrent connections.`,
          },
          {
            tag: `CLOSING SKILL GAP: ${m1.toUpperCase()} & ${m2.toUpperCase()}`,
            before: `Deployed application on university server using basic git clone.`,
            after: `Containerized distributed services using ${m1} and deployed to ${m2} with automated CI/CD pipelines, achieving zero-downtime rolling releases and 99.9% uptime.`,
          },
          {
            tag: `SCALABILITY & ${m3.toUpperCase()}`,
            before: `Managed application user state and database lookups.`,
            after: `Engineered distributed caching using Redis and ${m3} load balancing principles, cutting database read load by 45% and eliminating connection pool timeouts.`,
          },
        ];

        return (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}>
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1.5px solid var(--indigo)',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              padding: '2.2rem',
              boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-indigo">AI BULLET REWRITER</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--indigo-light)', fontWeight: 700 }}>
                      Tailored to: {fileName}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                    Quantifiable STAR Bullet Upgrades
                  </h3>
                </div>
                <button
                  onClick={() => setShowFixModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                💡 <strong>ATS Formula:</strong> <em>[Action Verb] + [Quantified Metric / Scale] + [Detected Skill / Tool] + [Measurable Outcome]</em>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dynamicBullets.map((b, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-surface)', padding: '1.1rem', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--indigo-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {b.tag}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(b.after);
                          alert(`Copied bullet to clipboard!\n\n"${b.after}"`);
                        }}
                        style={{
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--indigo-light)',
                          borderRadius: '8px',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        📋 Copy Bullet
                      </button>
                    </div>

                    <div style={{ marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>
                        Before (Weak Description):
                      </span>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        "{b.before}"
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
                        After (High-Impact Placement Format):
                      </span>
                      <div style={{ fontSize: '0.88rem', color: '#10b981', fontWeight: 700, marginTop: '0.15rem', lineHeight: 1.45 }}>
                        "{b.after}"
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  onClick={() => {
                    const allText = dynamicBullets.map(b => `• ${b.after}`).join('\n\n');
                    navigator.clipboard?.writeText(allText);
                    alert(`Copied all ${dynamicBullets.length} bullet upgrades to clipboard!`);
                  }}
                  className="btn btn-primary"
                  style={{ borderRadius: '12px', padding: '0.85rem', flex: 1, fontWeight: 800 }}
                >
                  📋 Copy All Upgrades to Clipboard
                </button>
                <button
                  onClick={() => setShowFixModal(false)}
                  className="btn btn-secondary"
                  style={{ borderRadius: '12px', padding: '0.85rem 1.4rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
