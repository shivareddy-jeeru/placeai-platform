import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import Dashboard from './pages/Dashboard';
import AnalysisView from './pages/AnalysisView';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import RoadmapView from './pages/RoadmapView';
import InterviewCoach from './pages/InterviewCoach';
import CompanyResearch from './pages/CompanyResearch';
import ProgressAnalytics from './pages/ProgressAnalytics';
import PlacementAssistant from './pages/PlacementAssistant';
import SettingsView from './pages/SettingsView';
import { SessionProvider, useSession } from './context/SessionContext';

function AppContent() {
  const { session, profile } = useSession();
  const location = useLocation();
  const isPublicLanding = location.pathname === '/';

  return (
    <div className="app-container" style={isPublicLanding ? { minHeight: '100vh' } : {}}>
      {/* Sidebar - conditionally rendered */}
      {!isPublicLanding && (
        <aside className="sidebar">
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span>⚡</span> PlaceAI
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0 1.5rem', marginBottom: '1.5rem' }}>
            Your AI Placement Assistant
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span style={{ marginRight: '0.75rem' }}>🏠</span> Dashboard
            </NavLink>
            <NavLink to="/analysis" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span style={{ marginRight: '0.75rem' }}>📊</span> Analysis Hub
            </NavLink>
            <NavLink to="/roadmap" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span style={{ marginRight: '0.75rem' }}>🗺️</span> Roadmap
            </NavLink>
            <NavLink to="/matcher" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span style={{ marginRight: '0.75rem' }}>💼</span> Job Matches
            </NavLink>
            <NavLink to="/interview" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span style={{ marginRight: '0.75rem' }}>🎤</span> Interview Coach
            </NavLink>
            <NavLink to="/progress" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span style={{ marginRight: '0.75rem' }}>📁</span> Saved Reports
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <span style={{ marginRight: '0.75rem' }}>⚙️</span> Settings
            </NavLink>
          </nav>

          {/* Promo Upgrade Card */}
          <div className="sidebar-promo-card" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem', fontSize: '1.25rem' }}>🚀</div>
            <div className="sidebar-promo-title" style={{ textAlign: 'center' }}>Unlock your dream career with AI ✨</div>
            <button className="sidebar-promo-btn" style={{ marginTop: '0.4rem' }}>Upgrade Now</button>
          </div>

          {/* Profile Card */}
          <div className="sidebar-profile">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
              alt="Avatar"
              className="profile-avatar"
            />
            <div className="profile-info">
              <span className="profile-name">{profile?.name || 'Shiva'}</span>
              <span className="profile-subtitle">{profile?.preferredRole || 'Final Year • IT'}</span>
              <span className="premium-badge">👑 Premium</span>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Only render header for non-landing pages */}
        {!isPublicLanding && (
          <header className="global-header" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '1rem 2rem',
            background: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            gap: '1.5rem',
            position: 'relative'
          }}>
          </header>
        )}

        <main className="main-content" style={isPublicLanding ? { padding: '1.5rem 2rem', background: 'transparent', overflowX: 'hidden' } : {}}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis" element={<AnalysisView />} />
            <Route path="/resume" element={<ResumeAnalyzer />} />
            <Route path="/matcher" element={<JobMatcher />} />
            <Route path="/skills" element={<SkillGapAnalysis />} />
            <Route path="/roadmap" element={<RoadmapView />} />
            <Route path="/interview" element={<InterviewCoach />} />
            <Route path="/research" element={<CompanyResearch />} />
            <Route path="/progress" element={<ProgressAnalytics />} />
            <Route path="/assistant" element={<PlacementAssistant />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SessionProvider>
      <Router>
        <AppContent />
      </Router>
    </SessionProvider>
  );
}

export default App;

