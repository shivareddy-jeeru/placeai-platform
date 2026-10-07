import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TodaysPlan from './pages/TodaysPlan';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import LearningRoadmap from './pages/LearningRoadmap';
import InterviewCoach from './pages/InterviewCoach';
import ProgressAnalytics from './pages/ProgressAnalytics';
import AchievementsView from './pages/AchievementsView';
import PlacementAssistant from './pages/PlacementAssistant';
import SettingsView from './pages/SettingsView';
import CompanyResearch from './pages/CompanyResearch';
import CodeReviewer from './pages/CodeReviewer';
import MentorBar from './components/MentorBar';

// ─── Route Guard ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0d14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6366f1', fontSize: '1.5rem', fontWeight: '800' }}>Loading PlaceAI…</div>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ─── Sidebar + Layout ────────────────────────────────────────────────────────
function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navGroups = [
    {
      group: '🏠 MY PLACEMENT JOURNEY',
      links: [{ path: '/', label: 'Dashboard', icon: '⚡' }]
    },
    {
      group: '🎯 MY PREPARATION',
      links: [
        { path: '/resume', label: 'Resume Analyzer', icon: '📄' },
        { path: '/job-matcher', label: 'Job Matcher', icon: '💼' },
        { path: '/skill-gap', label: 'Skill Gap Analysis', icon: '⚡' },
        { path: '/roadmap', label: 'Learning Roadmap', icon: '🗺️' }
      ]
    },
    {
      group: '🧠 PRACTICE & AI',
      links: [
        { path: '/code-reviewer', label: 'AI Code Reviewer', icon: '⚡' },
        { path: '/interview', label: 'AI Interview Coach', icon: '🎤' },
        { path: '/company-research', label: 'Company Research', icon: '🏢' },
        { path: '/mentor', label: 'AI Mentor', icon: '✨' },
        { path: '/settings', label: 'Settings', icon: '⚙️' }
      ]
    }
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0d14', color: '#ffffff', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* Mobile top bar */}
      <div className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem' }}>P</div>
          <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>PlaceAI</span>
        </div>
        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div style={{ padding: '1.75rem 1.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>P</div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>PlaceAI</h2>
            <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Placement Assistant</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 2rem' }}>
          {navGroups.map(grp => (
            <div key={grp.group} style={{ marginBottom: '1.25rem' }}>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                {grp.group}
              </span>
              {grp.links.map(l => {
                const isActive = location.pathname === l.path || (l.path === '/' && location.pathname === '/dashboard');
                return (
                  <Link
                    key={l.path}
                    to={l.path}
                    onClick={closeSidebar}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.65rem 0.85rem', borderRadius: '12px', marginBottom: '0.2rem',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                      textDecoration: 'none', fontSize: '0.88rem', fontWeight: isActive ? '800' : '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{l.icon}</span>
                    <span>{l.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #2d3342', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.95rem', flexShrink: 0 }}>
            {user?.full_name ? user.full_name[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name || user?.email}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Student Account</div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem', borderRadius: '6px', transition: 'color 0.2s' }}
          >
            ⏏
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/job-matcher" element={<JobMatcher />} />
          <Route path="/matcher" element={<JobMatcher />} />
          <Route path="/skill-gap" element={<SkillGapAnalysis />} />
          <Route path="/skills" element={<SkillGapAnalysis />} />
          <Route path="/roadmap" element={<LearningRoadmap />} />
          <Route path="/learning-roadmap" element={<LearningRoadmap />} />
          <Route path="/code-reviewer" element={<CodeReviewer />} />
          <Route path="/interview" element={<InterviewCoach />} />
          <Route path="/company-research" element={<CompanyResearch />} />
          <Route path="/mentor" element={<PlacementAssistant />} />
          <Route path="/assistant" element={<PlacementAssistant />} />
          <Route path="/todays-plan" element={<TodaysPlan />} />
          <Route path="/progress" element={<ProgressAnalytics />} />
          <Route path="/achievements" element={<AchievementsView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <MentorBar />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/*" element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            } />
          </Routes>
        </Router>
      </SessionProvider>
    </AuthProvider>
  );
}
