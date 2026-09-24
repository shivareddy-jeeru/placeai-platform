import React, { useState, useRef } from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';
import ProgressRing from '../components/ProgressRing';

const PRESET_JDS = {
  fullstack: `Full Stack Software Engineer position requiring proficiency in Python, FastAPI, Node.js, React, JavaScript, REST API design, PostgreSQL database optimization, Docker containerization, Git version control, and AWS cloud deployment. Candidates should demonstrate quantified achievements in API latency reduction and scalable microservices architecture.`,
  backend: `Senior Backend Engineer position requiring deep experience with Python, FastAPI, PostgreSQL, Redis caching, AsyncIO, REST APIs, Microservices, Unit Testing with Pytest, Docker, and Kubernetes. Strong knowledge of system design and database indexing is required.`,
  devops: `Cloud & DevOps Engineer responsible for Kubernetes, Docker, CI/CD pipelines, AWS, Terraform, Linux, Prometheus monitoring, and Infrastructure as Code. Experience with automated testing and container security mandatory.`
};

export default function ResumeAnalyzer() {
  const { placementProfile, startNewAnalysis, resetSession } = usePlacementProfile();
  const fileInputRef = useRef(null);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [targetJd, setTargetJd] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);

  const atsResult = placementProfile?.atsResult || null;

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
    }, 450);

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
    readability: 0,
    sections: 0,
    contact: 0,
    skills: 0,
    experience: 0,
    achievements: 0,
    education: 0,
    formatting: 0
  };

  const subCategories = [
    { label: 'ATS Readability & PDF Parsing', val: bd.readability, max: 15, color: '#6366f1' },
    { label: 'Standard Section Headings', val: bd.sections, max: 15, color: '#3b82f6' },
    { label: 'Contact Details & Profile Links', val: bd.contact, max: 10, color: '#10b981' },
    { label: 'Technical Skill Density', val: bd.skills, max: 15, color: '#8b5cf6' },
    { label: 'Experience & Project Structure', val: bd.experience, max: 15, color: '#c084fc' },
    { label: 'Quantified Impact Metrics', val: bd.achievements, max: 10, color: '#f59e0b' },
    { label: 'Education & Academic Qualification', val: bd.education, max: 5, color: '#ec4899' },
    { label: 'Formatting & Layout Warnings', val: bd.formatting, max: 15, color: '#14b8a6' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1240px', margin: '0 auto', paddingBottom: '140px' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── REAL-TIME SCANNING OVERLAY ─────────────────────────────── */}
      {analyzing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 17, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          color: '#ffffff'
        }}>
          <div style={{
            background: '#161925',
            border: '1px solid #6366f1',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.75rem',
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.25)',
            textAlign: 'center'
          }}>
            {/* Animated Radar Pulse Spinner */}
            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', animation: 'pulseRing 1.5s ease-out infinite' }} />
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', zIndex: 2, boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' }}>
                ⚡
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                Analyzing Resume in Real-Time…
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
                Deterministic ATS Engine parsing PDF text, skills & 8 rubrics
              </p>
            </div>

            {/* Scan Progress Steps */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', background: '#0f1117', padding: '1.2rem', borderRadius: '16px', border: '1px solid #2d3342' }}>
              {[
                { step: 1, label: '1. Extracting PDF/DOCX Binary Stream' },
                { step: 2, label: '2. Section Headings & Contact Details' },
                { step: 3, label: '3. Evaluating 8 Category Rubric Rules' },
                { step: 4, label: '4. Computing Skill Density & Job Match Score' }
              ].map(s => {
                const isActive = scanStep >= s.step;
                return (
                  <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '700', color: isActive ? '#34d399' : '#64748b', transition: 'all 0.3s ease' }}>
                    <span>{isActive ? '✓' : '○'}</span>
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: '#0f1117', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${scanStep * 25}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #34d399)', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── SCENARIO 1: UNANALYZED STATE / OPENING LANDING INTERFACE ──── */}
      {!atsResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* HERO OPENING CONTAINER */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(22, 25, 37, 0.95), rgba(15, 17, 23, 0.95))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '28px',
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.5rem',
            position: 'relative',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
          }}>
            <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '999px', padding: '0.4rem 1.2rem', fontSize: '0.78rem', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ⚡ REAL-TIME DETERMINISTIC ATS ENGINE
            </span>

            <h1 style={{ fontSize: '2.6rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Upload Your Resume for <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Instant ATS Audit & Job Match</span>
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '720px', margin: 0, lineHeight: 1.6 }}>
              Get a transparent, deterministic ATS compatibility score evaluated across 8 parsing categories. Paste a target Job Description to benchmark required technical skills in real time.
            </p>

            {/* PRESET JOB DESCRIPTION CONTROLS */}
            <div style={{ width: '100%', maxWidth: '820px', marginTop: '1rem', background: '#0f1117', border: '1px solid #2d3342', borderRadius: '20px', padding: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '800' }}>
                  🎯 Target Job Description (Optional — Select Preset or Paste)
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setTargetJd(PRESET_JDS.fullstack)}
                    style={{ background: '#161925', border: '1px solid #6366f1', color: '#818cf8', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    💻 Full Stack Dev
                  </button>
                  <button
                    onClick={() => setTargetJd(PRESET_JDS.backend)}
                    style={{ background: '#161925', border: '1px solid #8b5cf6', color: '#c084fc', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    🐍 Backend Python
                  </button>
                  <button
                    onClick={() => setTargetJd(PRESET_JDS.devops)}
                    style={{ background: '#161925', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    ☁️ Cloud DevOps
                  </button>
                </div>
              </div>

              <textarea
                value={targetJd}
                onChange={(e) => setTargetJd(e.target.value)}
                placeholder="Paste job description requirements here to evaluate Job Match Score & missing skill gaps..."
                rows={3}
                style={{ width: '100%', background: '#161925', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.85rem', color: '#ffffff', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            {/* MAIN DRAG & DROP UPLOAD BOX */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
              onDrop={handleDrop}
              style={{
                width: '100%',
                maxWidth: '820px',
                background: isDraggingOver ? 'rgba(99, 102, 241, 0.15)' : '#0f1117',
                border: `2px dashed ${isDraggingOver ? '#818cf8' : '#6366f1'}`,
                borderRadius: '24px',
                padding: '3rem 2rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
                boxShadow: isDraggingOver ? '0 0 30px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            >
              <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
                📄
              </div>

              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: '900', margin: '0 0 0.35rem 0' }}>
                  Drag & Drop Resume File Here
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>
                  Supports standard text PDF, DOCX, or TXT documents (Max 100 KB)
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
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
                ☁️ Select File & Run Real-Time Audit
              </button>
            </div>

            {/* FEATURE BADGES */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              {[
                '✓ 8 Category Deterministic Rubric',
                '✓ Real-Time Skill Keyword Extraction',
                '✓ OCR Scanned PDF Detector',
                '✓ Actionable ATS Fix Recommendations'
              ].map((b, i) => (
                <span key={i} style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: '800' }}>
                  {b}
                </span>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ─── SCENARIO 2: REAL ANALYSIS OUTPUT VIEW ───────────────────── */}
      {atsResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* TOP HEADER & ACTIONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '1.5rem 2rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ✓ REAL-TIME AUDIT COMPLETE
              </span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff', margin: '0.2rem 0 0.2rem 0' }}>
                Resume ATS & Job Match Audit Report
              </h1>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                📄 Active File: <strong style={{ color: '#818cf8' }}>{atsResult.fileName || 'Uploaded_Resume.pdf'}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                onClick={() => setShowJdInput(!showJdInput)}
                style={{ background: '#0f1117', color: '#ffffff', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.75rem 1.2rem', fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer' }}
              >
                {showJdInput ? '✕ Hide Target JD' : '🎯 Paste / Edit Target Job Description'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '0.75rem 1.4rem', fontSize: '0.85rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}
              >
                ☁️ Re-Analyze / Upload New
              </button>
            </div>
          </div>

          {/* TARGET JD INPUT DRAWER */}
          {showJdInput && (
            <div style={{ background: '#161925', border: '1px solid #6366f1', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ color: '#ffffff', margin: 0, fontSize: '1rem', fontWeight: 800 }}>Paste Target Job Description</h4>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setTargetJd(PRESET_JDS.fullstack)} style={{ background: '#0f1117', border: '1px solid #6366f1', color: '#818cf8', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>Preset: Full Stack</button>
                  <button onClick={() => setTargetJd(PRESET_JDS.backend)} style={{ background: '#0f1117', border: '1px solid #8b5cf6', color: '#c084fc', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>Preset: Python Backend</button>
                </div>
              </div>
              <textarea
                value={targetJd}
                onChange={(e) => setTargetJd(e.target.value)}
                placeholder="Paste job requirements here to compute a real Job Match Score..."
                rows={4}
                style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.85rem', color: '#ffffff', fontSize: '0.88rem', fontFamily: 'inherit', resize: 'vertical' }}
              />
              <button
                onClick={() => {
                  if (fileInputRef.current?.files?.[0]) {
                    runAnalysis(fileInputRef.current.files[0]);
                  } else {
                    alert('Please select a resume file using the Upload button to re-evaluate with this target JD.');
                  }
                }}
                style={{ alignSelf: 'flex-end', background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Re-calculate Match Score ➔
              </button>
            </div>
          )}

          {/* SCANNED PDF WARNING ALERT */}
          {atsResult.is_scanned_pdf && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '18px', padding: '1.2rem 1.5rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.92rem', fontWeight: 700 }}>
              <span style={{ fontSize: '1.6rem' }}>⚠️</span>
              <div>
                <strong>Scanned / Image-Based PDF Detected:</strong>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem', fontWeight: 500 }}>
                  Text extraction returned less than 80 characters. Please upload a standard text-based PDF or DOCX file to receive an accurate ATS evaluation.
                </div>
              </div>
            </div>
          )}

          {/* 2-SCORE HERO GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: atsResult.jobMatchScore !== null ? '1fr 1fr' : '1fr', gap: '1.75rem' }}>
            
            {/* RESUME ATS SCORE CARD */}
            <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <ProgressRing pct={atsResult.resumeAtsScore} size={135} stroke={12} color="#6366f1" label="ATS SCORE" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  DETERMINISTIC ATS SCORE
                </span>
                <h2 style={{ fontSize: '2.6rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                  {atsResult.resumeAtsScore} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/ 100</span>
                </h2>
                <span style={{ fontSize: '0.85rem', color: atsResult.resumeAtsScore >= 80 ? '#34d399' : '#f59e0b', fontWeight: '800' }}>
                  {atsResult.resumeAtsScore >= 80 ? '✓ Machine-Readable & ATS Ready' : '⚠️ Structural Improvements Recommended'}
                </span>
              </div>
            </div>

            {/* JOB MATCH SCORE CARD */}
            {atsResult.jobMatchScore !== null && (
              <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <ProgressRing pct={atsResult.jobMatchScore} size={135} stroke={12} color="#10b981" label="JOB MATCH" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    JOB DESCRIPTION MATCH
                  </span>
                  <h2 style={{ fontSize: '2.6rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                    {atsResult.jobMatchScore} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/ 100</span>
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: atsResult.jobMatchScore >= 80 ? '#34d399' : '#f59e0b', fontWeight: '800' }}>
                    {atsResult.jobMatchScore >= 80 ? '🎯 Highly Compatible with Target Role' : '⚡ Additional Keyword Alignment Needed'}
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* 8 CATEGORY BREAKDOWN METERS */}
          <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.2rem 0' }}>
                8 ATS Scoring Breakdown Categories
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Exact category breakdown calculated deterministically (Max 100 Points Total)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {subCategories.map(cat => {
                const pct = Math.round((cat.val / cat.max) * 100);
                return (
                  <div key={cat.label} style={{ background: '#0f1117', border: '1px solid #2d3342', borderRadius: '16px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '800', color: '#ffffff' }}>
                      <span>{cat.label}</span>
                      <span style={{ color: cat.color }}>{cat.val} / {cat.max}</span>
                    </div>
                    <div style={{ height: '7px', background: '#161925', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: cat.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MATCHED VS MISSING SKILLS CHIPS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
            {/* MATCHED SKILLS */}
            <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#34d399', margin: 0 }}>
                ✓ Detected & Matched Skills ({atsResult.matchedSkills?.length || atsResult.detectedSkills?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {(atsResult.matchedSkills?.length ? atsResult.matchedSkills : atsResult.detectedSkills)?.map(skill => (
                  <span key={skill} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: '800' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* MISSING SKILLS */}
            <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ef4444', margin: 0 }}>
                ⚠️ Missing Target Skills ({atsResult.missingSkills?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {atsResult.missingSkills?.length ? atsResult.missingSkills.map(skill => (
                  <span key={skill} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.82rem', fontWeight: '800' }}>
                    {skill}
                  </span>
                )) : (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No missing skills detected. Excellent skill alignment!</span>
                )}
              </div>
            </div>
          </div>

          {/* WARNINGS & RECOMMENDATIONS */}
          {((atsResult.warnings && atsResult.warnings.length > 0) || (atsResult.recommendations && atsResult.recommendations.length > 0)) && (
            <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                💡 Actionable Audit Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {atsResult.warnings?.map((w, idx) => (
                  <div key={idx} style={{ background: '#0f1117', borderLeft: '4px solid #f59e0b', borderRadius: '8px', padding: '0.85rem 1.1rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                    ⚠️ <strong>Audit Warning:</strong> {w}
                  </div>
                ))}
                {atsResult.recommendations?.map((r, idx) => (
                  <div key={idx} style={{ background: '#0f1117', borderLeft: '4px solid #6366f1', borderRadius: '8px', padding: '0.85rem 1.1rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                    🎯 <strong>Recommendation:</strong> {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECONDARY UPLOAD DROPZONE */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
            onDrop={handleDrop}
            style={{
              background: isDraggingOver ? 'rgba(99, 102, 241, 0.15)' : '#161925',
              border: `2px dashed ${isDraggingOver ? '#818cf8' : '#2d3342'}`,
              borderRadius: '24px',
              padding: '2.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{ fontSize: '2.2rem' }}>☁️</div>
            <div>
              <h4 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: '900', margin: '0 0 0.2rem 0' }}>
                Upload Another Resume to Evaluate
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Drag and drop PDF / DOCX file or click to choose from system.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
