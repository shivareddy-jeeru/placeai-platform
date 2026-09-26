import React from 'react';

export default function MetricCard({ label, value, subtext, icon, color = '#6366f1', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#161925',
        border: '1px solid #2d3342',
        borderRadius: '20px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div>
        <span style={{ fontSize: '0.68rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <strong style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', display: 'block', marginTop: '0.2rem', lineHeight: 1.1 }}>
          {value}
        </strong>
        {subtext && (
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem', display: 'block', fontWeight: '600' }}>
            {subtext}
          </span>
        )}
      </div>

      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: `${color}18`,
          border: `1px solid ${color}40`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem'
        }}
      >
        {icon}
      </div>
    </div>
  );
}
