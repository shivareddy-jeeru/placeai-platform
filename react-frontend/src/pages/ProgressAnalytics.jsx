import React from 'react';
import { useSession } from '../context/SessionContext';

const ProgressAnalytics = () => {
  const { history, session } = useSession();

  // 1. Line Chart Data (ATS Score Progress)
  // Use history if available, else current session, else empty.
  const graphHistory = history.length > 0 
    ? [...history].reverse()
    : session 
      ? [{ date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), atsScore: session.atsScore || 0 }]
      : [];

  // Dimensions
  const lineW = 320;
  const lineH = 150;
  const padding = 25;
  const points = graphHistory.map((item, idx) => {
    const x = padding + (idx * (lineW - 2 * padding)) / Math.max(1, graphHistory.length - 1);
    const score = item.atsScore || 0;
    // Map score 0-100 to height (lineH - padding) to padding (or 50-100 if we want better scale)
    const minScale = 40;
    const y = lineH - padding - ((Math.max(score, minScale) - minScale) * (lineH - 2 * padding)) / (100 - minScale);
    return { x, y, score, label: item.date };
  });

  let linePath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // 2. Bar Chart Data (Skill Gaps by Priority instead of fake weeks)
  const priorities = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  if (session?.skillGaps) {
    session.skillGaps.forEach(g => {
      if (priorities[g.priority] !== undefined) priorities[g.priority]++;
    });
  }
  const barData = [
    { label: 'Critical', count: priorities.Critical },
    { label: 'High', count: priorities.High },
    { label: 'Medium', count: priorities.Medium },
    { label: 'Low', count: priorities.Low }
  ];
  const barW = 320;
  const barH = 150;
  const maxCount = Math.max(...barData.map(d => d.count), 5); // at least 5 for scale

  // 3. Match Distribution
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
  const companies = session?.jobMatches?.map((match, idx) => ({
    name: match.company || 'Unknown',
    percent: match.matchPercent || match.match_percentage || 0,
    color: colors[idx % colors.length]
  })) || [];

  return (
    <div className="progress-analytics">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">📈 Progress Analytics</h1>
        <p className="page-subtitle">Track your placement preparedness metrics, skill improvements, and resume ATS score trends over time.</p>
      </header>

      {/* Analytics KPI Dashboard Grid */}
      <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Skills Extracted</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            {session?.extractedSkills ? `+${session.extractedSkills.length} Skills` : '0 Skills'}
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Saved Reports</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            {history.length} Sessions
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Readiness Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
            {session ? `${session.placementReadiness}%` : '0%'}
          </div>
        </div>
      </div>

      {/* SVG Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Graph 1: ATS Progress Line Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>📈 ATS Score Progress (Saved Reports)</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg width={lineW} height={lineH}>
              {/* Background grid lines */}
              <line x1={padding} y1={padding} x2={lineW - padding} y2={padding} stroke="rgba(255,255,255,0.05)" />
              <line x1={padding} y1={lineH / 2} x2={lineW - padding} y2={lineH / 2} stroke="rgba(255,255,255,0.05)" />
              <line x1={padding} y1={lineH - padding} x2={lineW - padding} y2={lineH - padding} stroke="rgba(255,255,255,0.05)" />

              {/* Line path */}
              {linePath && (
                <path d={linePath} fill="none" stroke="var(--accent-primary)" strokeWidth="3" />
              )}

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="var(--accent-primary)" strokeWidth="2" />
                  <text x={p.x} y={p.y - 10} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontWeight="bold">
                    {p.score}%
                  </text>
                  <text x={p.x} y={lineH - 5} fill="var(--text-secondary)" fontSize="10" textAnchor="middle">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Graph 2: Skill Gaps by Priority */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>📊 Skill Gaps by Priority</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {session?.skillGaps?.length > 0 ? (
              <svg width={barW} height={barH}>
                {barData.map((item, idx) => {
                  const w = 35;
                  const h = (item.count * (barH - 2 * padding)) / maxCount;
                  const x = padding + idx * ((barW - 2 * padding) / barData.length) + 15;
                  const y = barH - padding - h;
                  return (
                    <g key={idx}>
                      <rect x={x} y={y} width={w} height={h} rx="4" fill={item.count > 0 ? "var(--accent-secondary)" : "rgba(255,255,255,0.05)"} />
                      <text x={x + w / 2} y={y - 8} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontWeight="bold">
                        {item.count}
                      </text>
                      <text x={x + w / 2} y={barH - 5} fill="var(--text-secondary)" fontSize="10" textAnchor="middle">
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div style={{ height: barH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No skill gaps identified yet.
              </div>
            )}
          </div>
        </div>

        {/* Graph 3: Match Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>💼 Target Match Compatibilities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {companies.length > 0 ? companies.map((comp, idx) => (
              <div key={idx}>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>{comp.name} compatibility</span>
                  <strong>{comp.percent}% Match</strong>
                </div>
                <div className="bar-container" style={{ margin: 0, height: '8px' }}>
                  <div className="bar-value" style={{ width: `${comp.percent}%`, backgroundColor: comp.color }}></div>
                </div>
              </div>
            )) : (
              <div style={{ height: '100%', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No job match data available.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProgressAnalytics;
