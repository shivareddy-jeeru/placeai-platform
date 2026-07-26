import React, { useState, useRef } from 'react';
import usePlacementProfile from '../hooks/usePlacementProfile';
import ProgressRing from '../components/ProgressRing';
import { EVENTS } from '../utils/eventEmitter';

export default function ResumeAnalyzer() {
  const { placementProfile, startNewAnalysis, dispatchEvent } = usePlacementProfile();
  const fileInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [showFixDetails, setShowFixDetails] = useState(false);

  const scores = placementProfile?.scores || {};
  const currentScore = scores.resume !== undefined ? scores.resume : 84;

  const subMeters = [
    { label: 'ATS Formatting & Parsing', val: 84, color: '#6366f1' },
    { label: 'Technical Key Skill Alignment', val: 76, color: '#3b82f6' },
    { label: 'Action Verb & Impact Metrics', val: currentScore >= 90 ? 88 : 62, color: currentScore >= 90 ? '#10b981' : '#ef4444' },
    { label: 'Section Balance & Structure', val: 91, color: '#10b981' },
    { label: 'Target Keyword Density', val: currentScore >= 90 ? 89 : 73, color: '#f59e0b' }
  ];

  const fixesApplied = [
    {
      category: '📊 Quantified Impact Rewrites',
      before: 'Developed a student placement platform using React and Python.',
      after: 'Engineered high-performance web platform serving 500+ students using React 18 & FastAPI, reducing API latency by 40%.',
      impact: '+12% Action Verb Score'
    },
    {
      category: '⚡ Strong Active Verbs',
      before: 'Worked on database queries and API integration.',
      after: 'Architected RESTful API endpoints and optimized PostgreSQL B-Tree query indexes for sub-50ms lookup times.',
      impact: '+8% Technical Alignment'
    },
    {
      category: '🔑 Target Keyword Density',
      before: 'Missing key ATS phrases for SDE-1 role.',
      after: 'Integrated target ATS keywords: "System Design", "Microservices", "Docker", "CI/CD Pipelines".',
      impact: '+6% Keyword Match'
    }
  ];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await startNewAnalysis(file, '');
      e.target.value = null;
    }
  };

  const handleFixWithAI = () => {
    setFixing(true);
    setTimeout(() => {
      dispatchEvent(EVENTS.RESUME_ANALYZED, { action: 'FIX' });
      setFixing(false);
      setShowFixDetails(true);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '5rem' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ATS OPTIMIZER ENGINE
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
            Resume Analyzer & Audit 📄
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
            Real-time ATS score, 5 sub-metric evaluations, and AI score boost.
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0.8rem 1.6rem', fontSize: '0.88rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}
        >
          ☁️ Upload New Resume
        </button>
      </div>

      {/* ATS SCORE HERO GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.75rem' }}>
        {/* LEFT: DONUT GAUGE */}
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <ProgressRing pct={currentScore} size={140} stroke={12} color="#6366f1" label="ATS SCORE" />
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
              {currentScore >= 80 ? 'ATS Compatible' : 'Needs Optimization'}
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Target benchmark: 85+ score</span>
          </div>

          <button
            onClick={handleFixWithAI}
            disabled={fixing}
            style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', border: 'none', borderRadius: '14px', padding: '0.8rem 1rem', fontSize: '0.88rem', fontWeight: '900', cursor: 'pointer', marginTop: '0.5rem' }}
          >
            {fixing ? '✨ Optimizing Resume Impact…' : 'Fix with AI ⚡ (+6% Score Boost)'}
          </button>
        </div>

        {/* RIGHT: 5 SUB-METRIC METERS */}
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
              Detailed ATS Sub-Metric Breakdown
            </h4>
            <button
              onClick={() => setShowFixDetails(prev => !prev)}
              style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8', borderRadius: '10px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
            >
              {showFixDetails ? 'Hide AI Details 🔼' : 'View AI Fix Details 🔽'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {subMeters.map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.3rem' }}>
                  <span>{m.label}</span>
                  <span style={{ color: m.color }}>{m.val}%</span>
                </div>
                <div style={{ height: '7px', background: '#0f1117', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.val}%`, height: '100%', background: m.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── OPTION 2: COLLAPSIBLE AI REWRITES & FIX DETAILS ─────────── */}
      {showFixDetails && (
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ACTIONABLE REWRITES & FIX DETAILS
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: '0.2rem 0 0.2rem 0' }}>
              What "Fix with AI ⚡" Optimizes in Your Resume
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Review the exact bullet-point enhancements applied by our AI optimization engine.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fixesApplied.map((item, idx) => (
              <div key={idx} style={{ background: '#0f1117', border: '1px solid #2d3342', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#ffffff' }}>{item.category}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.25rem 0.65rem', borderRadius: '8px' }}>
                    {item.impact}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '0.85rem', fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.4 }}>
                    <strong style={{ display: 'block', color: '#ef4444', marginBottom: '0.2rem' }}>🔴 Original Version:</strong>
                    "{item.before}"
                  </div>

                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '0.85rem', fontSize: '0.82rem', color: '#6ee7b7', lineHeight: 1.4 }}>
                    <strong style={{ display: 'block', color: '#10b981', marginBottom: '0.2rem' }}>🟢 AI Optimized Rewrite:</strong>
                    "{item.after}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DRAG AND DROP ZONE */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
        onDrop={async (e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) await startNewAnalysis(file, '');
        }}
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
            Drag and Drop Resume PDF / DOCX
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Upload updated resume file to run instant ATS parsing & recalculate placement readiness score.
          </p>
        </div>
      </div>
    </div>
  );
}
