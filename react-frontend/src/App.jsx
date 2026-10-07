import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { SessionProvider, useSession } from './context/SessionContext';
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
import OnboardingModal from './components/OnboardingModal';
import AuthModal from './components/AuthModal';

function AppLayout() {
  const location = useLocation();
  const { user, isAuthenticated, logout, logDsaProblem, dashboardSummary } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const studentName = user?.full_name || 'Alex Chen (Demo)';
  const streak = user?.current_streak || dashboardSummary?.streak_count || 1;
  const targetRole = user?.target_role || 'Software Engineer';
  const readiness = dashboardSummary?.readiness_score || 0;

  const navGroups = [
    {
      group: '🏠 MY PLACEMENT JOURNEY',
      links: [
        { path: '/', label: 'Dashboard', icon: '⚡' }
      ]
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
        { path: '/interview', label: 'AI Interview Coach', icon: '🎤' },
        { path: '/code-reviewer', label: 'AI Code Reviewer', icon: '⚡' },
        { path: '/company-research', label: 'Company Research', icon: '🏢' },
        { path: '/mentor', label: 'AI Career Mentor', icon: '✨' },
        { path: '/progress', label: 'Analytics & Trends', icon: '📈' },
        { path: '/settings', label: 'Profile & Settings', icon: '⚙️' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#090b10', color: '#ffffff', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* ─── SIDEBAR ───────────────────────────────────────────────── */}
      <aside className="sidebar-container" style={{ width: '270px', minWidth: '270px', background: '#0e121d', borderRight: '1px solid #1e2638', display: 'flex', flexDirection: 'column' }}>
        {/* Brand Header */}
        <div style={{ padding: '1.5rem 1.5rem 1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
            P
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>PlaceAI</h2>
            <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Production Readiness</span>
          </div>
        </div>

        {/* Student Profile Quick Card */}
        <div style={{
          margin: '0 1rem 1rem 1rem',
          padding: '0.9rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
                {studentName.charAt(0)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {studentName}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: '700' }}>
                  {targetRole}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.72rem', color: '#f59e0b', fontWeight: '900' }}>
              <span>🔥</span>
              <span>{streak}d</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                flex: 1,
                background: '#161d2d',
                border: '1px solid #28334e',
                color: '#94a3b8',
                borderRadius: '8px',
                padding: '0.35rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              👤 Switch User
            </button>
            <button
              onClick={() => logDsaProblem(1)}
              title="Record 1 solved DSA problem in live database"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                borderRadius: '8px',
                padding: '0.35rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              +1 DSA
            </button>
          </div>
        </div>

        {/* Grouped Sidebar Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, overflowY: 'auto', padding: '0 1rem 2rem 1rem' }}>
          {navGroups.map(grp => (
            <div key={grp.group}>
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                {grp.group}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {grp.links.map(l => {
                  const isActive = location.pathname === l.path;
                  return (
                    <Link
                      key={l.path}
                      to={l.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '12px',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.15))' : 'transparent',
                        border: `1px solid ${isActive ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}`,
                        textDecoration: 'none',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? '800' : '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{l.icon}</span>
                      <span>{l.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────── */}
      <main className="main-container" style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Dashboard onOpenAuth={() => setShowAuthModal(true)} />} />
          <Route path="/dashboard" element={<Dashboard onOpenAuth={() => setShowAuthModal(true)} />} />
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
        </Routes>
      </main>

      {/* Persistent Page-Aware AI Mentor Bar */}
      <MentorBar />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* Student Authentication Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Router>
        <AppLayout />
      </Router>
    </SessionProvider>
  );
}
