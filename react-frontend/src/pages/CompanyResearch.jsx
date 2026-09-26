import React, { useState } from 'react';
import api from '../utils/api';

const CompanyResearch = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [error, setError] = useState(null);

  const popularCompanies = ['Google', 'Microsoft', 'Accenture', 'Meta', 'Amazon', 'Apple'];

  const handleSearch = async (companyName) => {
    const name = companyName || query;
    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.researchCompany(name);
      setResearchData(res.data.summary || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch research dossier. Please verify company name or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="company-research fade-in-up" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title">🏢 Company Intelligence & RAG Research</h1>
        <p className="page-subtitle">Search company overview profiles, recent product developments, and interview formats backed by internal placement guides.</p>
      </header>

      {/* Search Console */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem 2rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Type company name (e.g. Google)..."
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()} style={{ padding: '0.85rem 2rem' }}>
            {loading ? 'Searching RAG...' : '🔍 Research Company'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Suggestions:</span>
          {popularCompanies.map((c) => (
            <button
              key={c}
              className="badge-tag info"
              onClick={() => { setQuery(c); handleSearch(c); }}
              disabled={loading}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '3rem', height: '3rem' }}></div>
          <h3>Retrieving Grounded Placement Information...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Querying internal guides and corporate vector store...</p>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem 1.5rem', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Dossier Output */}
      {researchData && !loading && (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-gradient)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Placement Dossier</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>{researchData.company_name}</h2>
            </div>
            <div className="badge-tag success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>⚡ RAG Verified</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Overview & Products */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--text-title)' }}>
                  📖 Corporate Overview
                </h3>
                <p style={{ lineHeight: '1.7', color: 'var(--text-body)' }}>{researchData.overview}</p>
              </div>

              <div className="card">
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--text-title)' }}>
                  📦 Core Products & Divisions
                </h3>
                <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                  {researchData.products?.map((p, i) => (
                    <li key={i} style={{ color: 'var(--text-body)' }}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interviews & Hiring Trends */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ background: 'rgba(59, 130, 246, 0.02)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <h3 style={{ borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                  🎤 Interview Experiences & Formats
                </h3>
                <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                  {researchData.interview_experiences?.map((e, i) => (
                    <li key={i} style={{ color: 'var(--text-body)' }}>{e}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--text-title)' }}>
                  📈 Hiring Trends & Cutoffs
                </h3>
                <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                  {researchData.hiring_trends?.map((t, i) => (
                    <li key={i} style={{ color: 'var(--text-body)' }}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Developments */}
          <div className="card">
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--text-title)' }}>
              ⚡ Recent News & Product Innovations
            </h3>
            <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8' }}>
              {researchData.developments?.map((d, i) => (
                <li key={i} style={{ color: 'var(--text-body)' }}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyResearch;
