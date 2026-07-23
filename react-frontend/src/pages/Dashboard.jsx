import React, { useState, useRef } from 'react';
import { useSession, DEFAULT_DEMO_SESSION } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import AnalysisView from './AnalysisView';

/* ─── Mini Sparkline SVG ────────────────────────────────────── */
const Sparkline = ({ color = '#6366f1', up = true }) => {
  const pts = up
    ? '0,20 10,12 20,15 30,8 40,11 50,4 60,6 70,2'
    : '0,5 10,12 20,8 30,15 40,11 50,18 60,14 70,20';
  return (
    <svg width="70" height="22" viewBox="0 0 70 22" style={{ display: 'block' }}>
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function Dashboard() {
  const { profile, session, activeJobs, startNewAnalysis } = useSession();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showAnalysisHub, setShowAnalysisHub] = useState(false);

  const activeData = session || DEFAULT_DEMO_SESSION;

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

  // If user clicked View Analysis Hub or if a newly uploaded session is ready, show AnalysisView
  if (showAnalysisHub) {
    return <AnalysisView />;
  }

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await startNewAnalysis(file, '');
        setShowAnalysisHub(true);
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

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        await startNewAnalysis(file, '');
        setShowAnalysisHub(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1420px', margin: '0 auto', paddingBottom: '3rem' }}>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.docx,.txt" />

      {/* ─── 1. GREETING HEADER ────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.3rem 0', letterSpacing: '-0.02em' }}>
            👋 Welcome back, {profile?.name || 'Shiva'}
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0, fontWeight: '500' }}>
            Track your placement readiness, evaluate resumes, and benchmark missing skills.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setShowAnalysisHub(true)}
            style={{
              background: '#161925',
              border: '1px solid #2d3342',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '0.7rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            📊 View Full Analysis Hub
          </button>

          <button
            onClick={triggerUpload}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.7rem 1.5rem',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            ☁️ Upload Resume
          </button>
        </div>
      </div>

      {/* ─── 2. TOP KPI METRIC CARDS ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.25rem' }}>
        {/* Card 1: Target Role */}
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '18px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>💼</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TARGET ROLE</span>
          </div>
          <div>
            <strong style={{ fontSize: '1.05rem', color: '#ffffff', display: 'block' }}>{profile?.preferredRole || 'Software Engineer'}</strong>
            <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }}>Full Stack Dev ➔</span>
          </div>
        </div>

        {/* Card 2: Resumes Analyzed */}
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '18px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168,85,247,0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📄</div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>RESUMES ANALYZED</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff' }}>1</span>
              <span style={{ fontSize: '0.68rem', color: '#10b981', marginLeft: '0.5rem', fontWeight: '700' }}>↑ Active</span>
            </div>
            <Sparkline color="#c084fc" />
          </div>
        </div>

        {/* Card 3: Skills Extracted */}
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '18px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(236,72,153,0.15)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🧠</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>SKILLS EXTRACTED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff' }}>{activeData.extractedSkills?.length || 12}</span>
              <span style={{ fontSize: '0.68rem', color: '#10b981', marginLeft: '0.5rem', fontWeight: '700' }}>↑ Parsed</span>
            </div>
            <Sparkline color="#f472b6" />
          </div>
        </div>

        {/* Card 4: Job Matches */}
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '18px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🎯</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>JOB MATCHES</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff' }}>{activeData.jobMatches?.length || 3}</span>
              <span style={{ fontSize: '0.68rem', color: '#10b981', marginLeft: '0.5rem', fontWeight: '700' }}>Companies</span>
            </div>
            <Sparkline color="#34d399" />
          </div>
        </div>

        {/* Card 5: Average Readiness (No 0%!) */}
        <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '18px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📈</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>ATS READINESS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff' }}>{activeData.atsScore || 87}%</span>
              <span style={{ fontSize: '0.68rem', color: '#10b981', marginLeft: '0.5rem', fontWeight: '700' }}>High Match</span>
            </div>
            <Sparkline color="#60a5fa" />
          </div>
        </div>
      </div>

      {/* ─── 3. MAIN DASHBOARD CONTENT GRID ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.1fr', gap: '1.75rem' }}>

        {/* LEFT COLUMN: YOUR PLACEMENT JOURNEY & RESUME UPLOAD DROPZONE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* YOUR PLACEMENT JOURNEY TIMELINE */}
          <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.25rem 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              YOUR PLACEMENT JOURNEY
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 2rem 0' }}>
              Track your active progress metrics and milestones.
            </p>

            {/* Stepper Line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', margin: '0 1rem 1.5rem 1rem' }}>
              <div style={{ position: 'absolute', top: '18px', left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981 40%, #2d3342 100%)', zIndex: 1 }} />
              
              {[
                { label: 'Resume', icon: '📄', status: 'Completed', color: '#10b981' },
                { label: 'Match', icon: '🎯', status: 'Completed', color: '#10b981' },
                { label: 'Skills', icon: '⚡', status: 'Active', color: '#6366f1' },
                { label: 'Roadmap', icon: '🗺️', status: 'Planned', color: '#8b5cf6' },
                { label: 'Interview', icon: '🎤', status: 'Ready', color: '#ec4899' }
              ].map((step, idx) => (
                <div 
                  key={idx}
                  onClick={() => setShowAnalysisHub(true)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', zIndex: 2, cursor: 'pointer' }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#161925', border: `2px solid ${step.color}`, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '900', boxShadow: `0 0 12px ${step.color}40` }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#ffffff' }}>{step.label}</span>
                  <span style={{ fontSize: '0.65rem', color: step.color, fontWeight: '700' }}>{step.status}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#0f1117', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #2d3342', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
                Complete each step to strengthen your profile and boost your placement readiness.
              </span>
              <button onClick={() => setShowAnalysisHub(true)} style={{ background: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                Open Hub ➔
              </button>
            </div>
          </div>

          {/* INTEGRATED RESUME UPLOAD DROPZONE */}
          <div 
            onClick={triggerUpload}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              background: isDraggingOver ? 'rgba(99, 102, 241, 0.12)' : '#161925',
              border: `2px dashed ${isDraggingOver ? '#818cf8' : '#2d3342'}`,
              borderRadius: '24px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
              ☁️
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', margin: '0 0 0.35rem 0' }}>
                Upload or Drop Your Resume to Re-Analyze
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, fontWeight: '500' }}>
                Supports PDF, DOCX, and TXT • Automatic ATS & Skill Gap Parsing
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); triggerUpload(); }}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.65rem 1.6rem',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              Select Resume File
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: ACTIVE ACTION & TOP SKILL GAPS (CLEAN, NO 0%!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* NEXT BEST ACTION CARD */}
          <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              ⚡
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NEXT BEST ACTION</span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ffffff', margin: '2px 0' }}>Review Week 1 System Design Roadmap</h4>
              <span style={{ fontSize: '0.78rem', color: '#818cf8', fontWeight: '800', cursor: 'pointer' }} onClick={() => navigate('/roadmap')}>Start Learning Tasks ➔</span>
            </div>
          </div>

          {/* TOP SKILL GAPS (CLEAN PRIORITY TAGS, NO 0%!) */}
          <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                TOP SKILL GAPS TO CLOSE
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '800', cursor: 'pointer' }} onClick={() => navigate('/skills')}>View All ➔</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { name: 'System Design & Distributed Scalability', priority: 'Critical', color: '#ef4444' },
                { name: 'Docker Compose & Kubernetes Deployments', priority: 'High', color: '#f59e0b' },
                { name: 'Advanced PostgreSQL B-Tree Query Tuning', priority: 'Medium', color: '#3b82f6' }
              ].map((gap, i) => (
                <div key={i} style={{ background: '#0f1117', border: '1px solid #2d3342', borderRadius: '12px', padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>{gap.name}</span>
                  <span style={{ fontSize: '0.7rem', background: `${gap.color}20`, color: gap.color, border: `1px solid ${gap.color}40`, padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: '800' }}>
                    {gap.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
