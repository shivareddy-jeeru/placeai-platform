import React from 'react';

export default function RubricScore({ rubric }) {
  if (!rubric) return null;

  const metrics = [
    { label: 'Communication Clarity', val: rubric.communication, max: 10, color: '#3b82f6' },
    { label: 'Technical Accuracy', val: rubric.technicalAccuracy, max: 10, color: '#8b5cf6' },
    { label: 'Problem Structure (STAR)', val: rubric.structure, max: 10, color: '#ec4899' },
    { label: 'Delivery & Confidence', val: rubric.confidence, max: 10, color: '#10b981' }
  ];

  return (
    <div style={{ background: '#0f1117', border: '1px solid rgba(236, 72, 153, 0.35)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            AI EVALUATION RUBRIC
          </span>
          <h4 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', margin: '2px 0 0 0' }}>
            Overall Score: {rubric.overallScore}%
          </h4>
        </div>
        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid #10b981', fontSize: '0.75rem', fontWeight: '900', padding: '0.3rem 0.8rem', borderRadius: '999px' }}>
          ✓ Target Met
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '14px', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '800' }}>{m.label}</span>
            <strong style={{ fontSize: '1.4rem', color: m.color, display: 'block', marginTop: '0.2rem' }}>
              {m.val} / {m.max}
            </strong>
          </div>
        ))}
      </div>

      <div style={{ background: '#161925', border: '1px solid #2d3342', borderRadius: '14px', padding: '1.1rem', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.4 }}>
        💡 <strong style={{ color: '#ffffff' }}>AI Mentor Feedback:</strong> {rubric.feedback}
      </div>
    </div>
  );
}
