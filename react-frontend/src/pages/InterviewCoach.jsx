import React from 'react';
import InterviewRoom from '../components/InterviewRoom';

export default function InterviewCoach() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* HEADER */}
      <div>
        <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          INTERVIEW SIMULATION ENGINE
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#ffffff', margin: '0.3rem 0 0.4rem 0' }}>
          AI Mock Interview Coach 🎤
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: 0 }}>
          Practice real-time STAR technical & behavioral scenario questions with instant 4-metric rubric scoring.
        </p>
      </div>

      {/* EMBEDDED INTERVIEW ROOM SIMULATOR */}
      <InterviewRoom />
    </div>
  );
}
