import React, { useState, useRef } from 'react';
import { useSession } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import AnalysisView from './AnalysisView';

export default function Dashboard() {
  const { session, profile, activeJobs, startNewAnalysis } = useSession();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const runningJob = Object.values(activeJobs)[0];
  if (runningJob) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: '1.25rem', background: '#0f1117', width: '100%', padding: '2rem', color: '#ffffff' }}>
        <div className="spinner" style={{ borderTopColor: '#6366f1', width: '3.5rem', height: '3.5rem' }} />
        <h3 style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.4rem' }}>AI is analyzing your resume…</h3>
        <div style={{ width: '360px', height: '8px', background: '#1e2438', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${runningJob.progress}%`, height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ color: '#94a3b8', fontSize: '0.88rem', fontWeight: 700 }}>{runningJob.progress}% Complete • Extracting Skills & Computing ATS Score</span>
      </div>
    );
  }

  // If a session exists, render the full multi-tab AnalysisView with updated resume details!
  if (session) {
    return <AnalysisView />;
  }

  // Otherwise (if no active session/after reset), show the Upload Resume Landing Page!
  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        await startNewAnalysis(file, '');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      startNewAnalysis(file, '');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%', maxWidth: '1100px', margin: '1rem auto 4rem auto' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── 1. PAGE HEADER ────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
          Resume Analyzer & ATS Audit 📄
        </h1>
        <p style={{ fontSize: '0.98rem', color: '#94a3b8', margin: 0, fontWeight: '500', lineHeight: 1.5 }}>
          Upload your candidate resume to receive an instant ATS score, skill gap analysis, custom job matches, and a 4-week technical roadmap.
        </p>
      </div>

      {/* ─── 2. INTERACTIVE UPLOAD DROPZONE ─────────────────────────── */}
      <div 
        onClick={triggerUpload}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: isDraggingOver ? 'rgba(99, 102, 241, 0.12)' : '#161925',
          border: `2px dashed ${isDraggingOver ? '#818cf8' : '#2d3342'}`,
          borderRadius: '24px',
          padding: '4rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem' }}>
          ☁️
        </div>

        {selectedFile ? (
          <div>
            <strong style={{ fontSize: '1.2rem', color: '#34d399', display: 'block', marginBottom: '0.25rem' }}>
              ✓ Selected File: {selectedFile.name}
            </strong>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Analyzing your resume now...</span>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              Drag & drop your resume here, or <span style={{ color: '#818cf8', textDecoration: 'underline' }}>browse file</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, fontWeight: '500' }}>
              Supports PDF, DOCX, and TXT files • 100% Confidential AI Analysis
            </p>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); triggerUpload(); }}
          style={{
            marginTop: '0.5rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.85rem 2rem',
            fontSize: '0.95rem',
            fontWeight: '800',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>✨</span> Select Resume File
        </button>
      </div>

      {/* ─── 3. WHAT HAPPENS AFTER UPLOAD ─────────────────────────── */}
      <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '20px', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>📄</div>
          <strong style={{ color: '#ffffff', fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>1. Instant ATS Rating</strong>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Recruiter readability & formatting index</span>
        </div>
        <div>
          <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>📊</div>
          <strong style={{ color: '#ffffff', fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>2. Skill Gap Detection</strong>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Missing tech stack priorities for target role</span>
        </div>
        <div>
          <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>🗺️</div>
          <strong style={{ color: '#ffffff', fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>3. 4-Week Study Plan</strong>
          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Personalized roadmap to placement readiness</span>
        </div>
      </div>

    </div>
  );
}
