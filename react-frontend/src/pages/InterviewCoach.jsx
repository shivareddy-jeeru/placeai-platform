import React, { useState } from 'react';
import InterviewRoom from '../components/InterviewRoom';

export default function InterviewCoach() {
  const [selectedType, setSelectedType] = useState('project');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1380px', margin: '0 auto', paddingBottom: '6rem' }}>
      
      {/* ─── HERO HEADER ─────────────────────────────────────────────── */}
      <div className="saas-hero-card" style={{ padding: '2.8rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '780px' }}>
            <span className="saas-pill" style={{ marginBottom: '1rem', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.3)' }}>
              AI INTERVIEW COACH & SIMULATOR
            </span>
            <h1 className="hero-giant-title" style={{ margin: '0.4rem 0 0.8rem 0' }}>
              Your next interview starts here.
            </h1>
            <p className="hero-lead-text" style={{ margin: 0 }}>
              Practice realistic Technical, Behavioral STAR, and Project architecture interviews with real-time scoring across communication, technical precision, confidence, and filler word detection.
            </p>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.6rem', borderRadius: '18px', border: '1px solid var(--border-default)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Mock Status</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ec4899' }}>10 Completed</div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Avg Score: 79/100</div>
          </div>
        </div>
      </div>

      {/* ─── EMBEDDED INTERVIEW ROOM ──────────────────────────────────── */}
      <InterviewRoom
        interviewType={selectedType}
        onTypeChange={(type) => setSelectedType(type)}
      />

    </div>
  );
}
