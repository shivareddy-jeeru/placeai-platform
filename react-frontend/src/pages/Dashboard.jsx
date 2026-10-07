import React, { useState, useRef } from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import ProgressRing from '../components/ProgressRing';

export default function Dashboard({ onOpenAuth }) {
  const {
    user,
    dashboardSummary,
    startNewAnalysis,
    logDsaProblem,
    refreshDashboard
  } = useSession();

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const studentName = user?.full_name || 'Student';
  const targetRole = user?.target_role || 'Software Engineer';
  const streak = user?.current_streak || dashboardSummary?.streak_count || 1;
  const dsaSolved = user?.dsa_problems_solved ?? dashboardSummary?.dsa_problems_solved ?? 0;

  // Real data metrics from backend
  const readiness = dashboardSummary?.readiness_score || 0;
  const atsScore = dashboardSummary?.latest_ats_score || 0;
  const jobMatch = dashboardSummary?.latest_match_percentage || 0;
  const skillsList = dashboardSummary?.skills_extracted || [];
  const breakdown = dashboardSummary?.readiness_breakdown || {};
  const recentMatches = dashboardSummary?.recent_matches || [];
  const priorityAction = {
    title: dashboardSummary?.priority_action_title || "Upload Technical Resume",
    reason: dashboardSummary?.priority_action_reason || "Run your resume through the deterministic 9-factor ATS scorer to extract skills.",
    module: dashboardSummary?.priority_action_module || "Resume Analyzer"
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUpload(file);
    }
  };

  const processUpload = async (file) => {
    setAnalyzing(true);
    try {
      await startNewAnalysis(file, '');
      await refreshDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processUpload(file);
    }
  };

  const getModuleRoute = (moduleName) => {
    switch (moduleName) {
      case 'Resume Analyzer': return '/resume';
      case 'Job Matcher': return '/job-matcher';
      case 'Learning Roadmap': return '/roadmap';
      case 'Interview Coach': return '/interview';
      case 'Company Research': return '/company-research';
      default: return '/resume';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1360px', margin: '0 auto', paddingBottom: '3rem' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── 1. TOP HEADER & GREETING ─────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              👋 Welcome back, {studentName}
            </h1>
            <span style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#a5b4fc',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '800'
            }}>
              {targetRole}
            </span>
          </div>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
            Real-time Placement Readiness calculated deterministically from stored backend records.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setShowFormulaModal(true)}
            style={{
              background: '#161d2d',
              border: '1px solid #28334e',
              color: '#cbd5e1',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              fontSize: '0.84rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <span>📐</span>
            <span>Readiness Formula</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>📄</span>
            <span>Upload Resume</span>
          </button>
        </div>
      </div>

      {/* ─── 2. PRIORITY ACTION BANNER ────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.08))',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '20px',
        padding: '1.5rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            🎯
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
              TODAY'S HIGHEST VALUE ACTION • DERIVED FROM REAL GAPS
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.25rem 0' }}>
              {priorityAction.title}
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: 0, maxWidth: '720px' }}>
              {priorityAction.reason}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(getModuleRoute(priorityAction.module))}
          style={{
            background: '#ffffff',
            color: '#0f172a',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 1.4rem',
            fontWeight: '800',
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.2s'
          }}
        >
          Take Action in {priorityAction.module} →
        </button>
      </div>

      {/* ─── 3. CORE METRICS GRID ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card 1: Readiness Index */}
        <div style={{
          background: '#111625',
          border: '1px solid #28334e',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                COMPOSITE SCORE
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                Readiness Index
              </h4>
            </div>
            <div style={{ width: '56px', height: '56px' }}>
              <ProgressRing percentage={Math.round(readiness)} size={56} strokeWidth={5} color="#6366f1" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>
              {readiness.toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Based on 6 weighted placement pillars
            </span>
          </div>
        </div>

        {/* Card 2: ATS Resume Score */}
        <div style={{
          background: '#111625',
          border: '1px solid #28334e',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                DETERMINISTIC 9-FACTOR
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                Resume ATS Score
              </h4>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              📄
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: atsScore > 0 ? '#38bdf8' : '#64748b', letterSpacing: '-0.02em' }}>
              {atsScore > 0 ? `${atsScore.toFixed(0)}/100` : 'Not Uploaded'}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {atsScore > 0 ? 'Verified structural ATS readability' : 'Upload PDF/DOCX to score'}
            </span>
          </div>
        </div>

        {/* Card 3: Target Job Match */}
        <div style={{
          background: '#111625',
          border: '1px solid #28334e',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                SKILL OVERLAP
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                Target Job Match
              </h4>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              💼
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: jobMatch > 0 ? '#34d399' : '#64748b', letterSpacing: '-0.02em' }}>
              {jobMatch > 0 ? `${jobMatch.toFixed(0)}%` : 'No Match Run'}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {jobMatch > 0 ? 'Alignment with target role' : 'Target a job description'}
            </span>
          </div>
        </div>

        {/* Card 4: Daily Consistency & DSA */}
        <div style={{
          background: '#111625',
          border: '1px solid #28334e',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ACTIVE STREAK & DSA
              </span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                Practice Consistency
              </h4>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              🔥
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: '#f59e0b', letterSpacing: '-0.02em' }}>
                {streak} Days
              </div>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '800' }}>
                • {dsaSolved} Solved
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Persisted in SQLite database</span>
              <button
                onClick={() => logDsaProblem(1)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#34d399',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                +1 Problem
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. RESUME UPLOAD DROPZONE & VERIFIED SKILLS ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Upload Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
          onDrop={handleDrop}
          style={{
            background: isDraggingOver ? 'rgba(99, 102, 241, 0.12)' : '#111625',
            border: `2px dashed ${isDraggingOver ? '#818cf8' : '#28334e'}`,
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            {analyzing ? '⏳' : '📤'}
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: '0 0 0.35rem 0' }}>
              {analyzing ? 'Evaluating Resume ATS Score…' : 'Upload or Drag & Drop Resume'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, maxWidth: '380px' }}>
              Supports PDF, DOCX, and TXT files up to 10 MB. Encrypted or empty files are safely rejected.
            </p>
          </div>

          <span style={{
            background: '#161d2d',
            border: '1px solid #28334e',
            color: '#a5b4fc',
            padding: '0.45rem 1rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: '700'
          }}>
            Browse Local File
          </span>
        </div>

        {/* Verified Skills Stack */}
        <div style={{
          background: '#111625',
          border: '1px solid #28334e',
          borderRadius: '24px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                AUTHENTIC PROFILE
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                Verified Skill Footprint
              </h3>
            </div>
            <span style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              fontSize: '0.75rem',
              fontWeight: '800',
              padding: '0.25rem 0.6rem',
              borderRadius: '8px'
            }}>
              {skillsList.length} Verified
            </span>
          </div>

          {skillsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>No skills extracted yet. Upload a resume to populate your verified skill profile.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {skillsList.map(skill => (
                <span
                  key={skill}
                  style={{
                    background: '#161d2d',
                    border: '1px solid #28334e',
                    color: '#e2e8f0',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: '700'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #1e2638', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Target: 10 core placement skills</span>
            <button
              onClick={() => navigate('/skill-gap')}
              style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}
            >
              Analyze Skill Gaps →
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5. READINESS BREAKDOWN MODAL ─────────────────────────── */}
      {showFormulaModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 11, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: '#111625',
            border: '1px solid #28334e',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '650px',
            padding: '2.5rem',
            color: '#ffffff',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: '800', textTransform: 'uppercase' }}>DOCUMENTED WEIGHTED MODEL</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0.2rem 0 0 0' }}>Readiness Index Formula</h3>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#0a0d14', border: '1px solid #1e2638', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
              Readiness = 20% Resume + 25% Skills + 20% Job Match + 20% Interview + 10% DSA + 5% Progress
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {Object.entries(breakdown).map(([key, item]) => {
                const labels = {
                  resume_quality: '1. Resume Quality (20% max)',
                  skills: '2. Technical Skills (25% max)',
                  job_match: '3. Job Match Alignment (20% max)',
                  interview_performance: '4. Interview Performance (20% max)',
                  dsa_assessment: '5. DSA Problem Solving (10% max)',
                  learning_progress: '6. Learning Roadmap Progress (5% max)'
                };
                return (
                  <div key={key} style={{ background: '#161d2d', padding: '0.85rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: '800' }}>{labels[key] || key}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.status}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#38bdf8' }}>+{item.contribution}%</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Score: {item.score}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button
                onClick={() => setShowFormulaModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.7rem 1.5rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
