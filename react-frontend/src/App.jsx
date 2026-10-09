import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './context/SessionContext';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import LearningRoadmap from './pages/LearningRoadmap';
import CompanyResearch from './pages/CompanyResearch';
import InterviewCoach from './pages/InterviewCoach';
import PlacementAssistant from './pages/PlacementAssistant';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import AchievementsView from './pages/AchievementsView';
import AnalysisView from './pages/AnalysisView';
import OnboardingModal from './components/OnboardingModal';

// ─── Crisp Modern SVGs for PlaceAI Nav ────────────────────────────────────────
const IconDashboard = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const IconResume = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const IconJobs = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconSkillMap = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const IconRoadmap = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
    <circle cx="5" cy="6" r="2" />
    <circle cx="19" cy="12" r="2" />
    <circle cx="5" cy="18" r="2" />
  </svg>
);

const IconInterview = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const IconMentor = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const IconCompanies = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="9" y1="22" x2="9" y2="18" />
    <line x1="15" y1="22" x2="15" y2="18" />
    <line x1="8" y1="6" x2="10" y2="6" />
    <line x1="14" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="10" y2="10" />
    <line x1="14" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="10" y2="14" />
    <line x1="14" y1="14" x2="16" y2="14" />
  </svg>
);

const IconAchievements = () => (
  <svg className="sidebar-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppLayout() {
  const location = useLocation();
  const { session, theme, toggleTheme } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const readiness = session?.scores?.readiness ?? 79;
  const resumeScore = session?.scores?.resume ?? 89;
  const jobMatchScore = session?.scores?.jobMatch ?? 82;
  const skillsScore = session?.scores?.skills ?? 68;
  const interviewScore = session?.scores?.interview ?? 79;
  const unlockedBadges = session?.achievements?.filter(a => a.unlocked).length ?? 4;
  const totalBadges = session?.achievements?.length ?? 6;
  const targetCompaniesCount = session?.identity?.targetCompanies?.length ?? 6;
  const activeRoadmapPhase = session?.progress?.currentPhase || 'Phase 2';

  // Dynamic navigation items that react in real-time to profile, resume, interview, and task updates
  const navItems = [
    { path: '/dashboard',     label: 'Dashboard',        badge: `${readiness}%`,                   badgeClass: readiness >= 80 ? 'badge-green' : 'badge-cyan',   Icon: IconDashboard },
    { path: '/resume',        label: 'Resume AI',        badge: `${resumeScore}/100`,              badgeClass: resumeScore >= 85 ? 'badge-indigo' : 'badge-amber',Icon: IconResume },
    { path: '/job-matcher',   label: 'Job Matcher',      badge: `${jobMatchScore}%`,               badgeClass: jobMatchScore >= 85 ? 'badge-green' : 'badge-cyan', Icon: IconJobs },
    { path: '/skill-map',     label: 'Skill Map',        badge: `${skillsScore}%`,                 badgeClass: skillsScore >= 75 ? 'badge-green' : 'badge-amber', Icon: IconSkillMap },
    { path: '/roadmap',       label: 'Roadmap',          badge: activeRoadmapPhase,                 badgeClass: 'badge-violet',                                     Icon: IconRoadmap },
    { path: '/interview',     label: 'Interview Coach',  badge: `${interviewScore}/100`,           badgeClass: interviewScore >= 80 ? 'badge-green' : 'badge-pink',Icon: IconInterview },
    { path: '/mentor',        label: 'AI Mentor',        badge: 'Active',                          badgeClass: 'badge-indigo',                                     Icon: IconMentor },
    { path: '/companies',     label: 'Companies',        badge: `${targetCompaniesCount} Target`,  badgeClass: 'badge-gray',                                       Icon: IconCompanies },
    { path: '/achievements',  label: 'Achievements',     badge: `${unlockedBadges}/${totalBadges}`, badgeClass: unlockedBadges >= 5 ? 'badge-green' : 'badge-amber',Icon: IconAchievements },
  ];

  const isActive = (path) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    return location.pathname.startsWith(path);
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const studentName = session?.identity?.name || 'Shiva';
  const targetRole = session?.identity?.targetRole || 'Software Engineer';

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* Mobile top bar */}
      <div className="mobile-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div className="sidebar-logo-mark" style={{ width: 32, height: 32, fontSize: '0.9rem' }}>P</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', display: 'block' }}>PlaceAI</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Command Center</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-mark">P</div>
          <div style={{ flex: 1 }}>
            <div className="sidebar-brand-name">PlaceAI</div>
            <div className="sidebar-brand-tag">Placement Command Center</div>
          </div>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.2rem',
              opacity: 0.8,
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Core Command</div>
          {navItems.slice(0, 5).map(({ path, label, badge, badgeClass, Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={closeSidebar}
              className={`sidebar-nav-item ${isActive(path) ? 'active' : ''}`}
            >
              <Icon />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && <span className={`badge ${badgeClass}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.45rem' }}>{badge}</span>}
            </Link>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: '0.8rem' }}>AI Acceleration</div>
          {navItems.slice(5).map(({ path, label, badge, badgeClass, Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={closeSidebar}
              className={`sidebar-nav-item ${isActive(path) ? 'active' : ''}`}
            >
              <Icon />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && <span className={`badge ${badgeClass}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.45rem' }}>{badge}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile Card & Quick Setup */}
        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={() => setShowOnboarding(true)}
            title="Click to edit Target Role & Preferences"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="sidebar-user-name" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>{studentName}</span>
                  <span style={{ fontSize: '0.7rem' }}>👋</span>
                </div>
                <div className="sidebar-user-role">{targetRole}</div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--indigo-light)', fontWeight: 700 }}>⚙️ Edit</span>
          </div>
        </div>
      </aside>

      {/* Main Command Center Canvas */}
      <main className="main-container">
        <Routes>
          <Route path="/"                  element={<Dashboard />} />
          <Route path="/dashboard"         element={<Dashboard />} />
          <Route path="/overview"          element={<Dashboard />} />
          <Route path="/resume"            element={<ResumeAnalyzer />} />
          <Route path="/analysis"          element={<AnalysisView />} />
          <Route path="/job-matcher"       element={<JobMatcher />} />
          <Route path="/matcher"           element={<JobMatcher />} />
          <Route path="/skill-map"         element={<SkillGapAnalysis />} />
          <Route path="/skill-gap"         element={<SkillGapAnalysis />} />
          <Route path="/roadmap"           element={<LearningRoadmap />} />
          <Route path="/interview"         element={<InterviewCoach />} />
          <Route path="/mentor"            element={<PlacementAssistant />} />
          <Route path="/companies"         element={<CompanyResearch />} />
          <Route path="/company-research"  element={<CompanyResearch />} />
          <Route path="/achievements"      element={<AchievementsView />} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Profile & Target Role Setup Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
}

// ─── Root Provider ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </SessionProvider>
  );
}
