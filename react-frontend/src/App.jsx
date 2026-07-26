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
import MentorBar from './components/MentorBar';
import OnboardingModal from './components/OnboardingModal';

function AppLayout() {
  const location = useLocation();
  const { placementProfile } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const isOpeningDashboard = location.pathname === '/';
  const scores = placementProfile?.scores || {};

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
        { path: '/company-research', label: 'Company Research', icon: '🏢' },
        { path: '/mentor', label: 'AI Mentor', icon: '✨' },
        { path: '/settings', label: 'Settings', icon: '⚙️' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: isOpeningDashboard ? '#f8fafc' : '#0b0d14', color: isOpeningDashboard ? '#0f172a' : '#ffffff', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>

      {/* ─── SIDEBAR (HIDDEN ONLY ON OPENING DASHBOARD '/') ─────────── */}
      {!isOpeningDashboard && (
        <aside style={{
          width: '275px',
          background: '#161925',
          borderRight: '1px solid #2d3342',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 900
        }}>
          {/* Brand Header */}
          <div style={{ padding: '1.75rem 1.5rem 1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
              P
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>PlaceAI</h2>
              <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Placement Assistant</span>
            </div>
          </div>

          {/* Readiness Badge Widget */}
          <div style={{ margin: '0 1.25rem 1.5rem 1.25rem', background: '#0f1117', border: '1px solid #2d3342', borderRadius: '14px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '800' }}>READINESS SCORE</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10b981' }}>{scores.readiness !== undefined ? scores.readiness : 72}% Ready</div>
            </div>
            <button onClick={() => setShowOnboarding(true)} style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8', borderRadius: '8px', padding: '0.3rem 0.6rem', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>
              Goal ⚙️
            </button>
          </div>

          {/* Grouped Sidebar Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, overflowY: 'auto', padding: '0 1.25rem 2rem 1.25rem' }}>
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
      )}

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────── */}
      <main style={{
        marginLeft: isOpeningDashboard ? '0' : '275px',
        flex: 1,
        padding: isOpeningDashboard ? '0' : '2.5rem 3rem 6rem 3rem',
        background: isOpeningDashboard ? '#f8fafc' : '#0b0d14',
        minHeight: '100vh',
        width: '100%'
      }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/job-matcher" element={<JobMatcher />} />
          <Route path="/matcher" element={<JobMatcher />} />
          <Route path="/skill-gap" element={<SkillGapAnalysis />} />
          <Route path="/skills" element={<SkillGapAnalysis />} />
          <Route path="/roadmap" element={<LearningRoadmap />} />
          <Route path="/learning-roadmap" element={<LearningRoadmap />} />
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

      {/* Persistent Page-Aware AI Mentor Bar (Hidden on / opening dashboard) */}
      {!isOpeningDashboard && <MentorBar />}

      {/* Onboarding Wizard Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
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
