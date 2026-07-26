import React from 'react';

export default function ProgressRing({ pct = 72, size = 110, stroke = 10, color = '#10b981', label = 'READINESS' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e2438"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', lineHeight: 1, display: 'block' }}>
          {pct}%
        </span>
        <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.06em' }}>
          {label}
        </span>
      </div>
    </div>
  );
}
