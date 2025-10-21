import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import LocationConsent from './components/ui/LocationConsent';
import Footer from './components/layout/Footer';
import TabBar from './components/layout/TabBar';
import Home from './pages/Home';
import TutorsFeed from './pages/feeds/TutorsFeed';
import StudentsFeed from './pages/feeds/StudentsFeed';
import Messages from './pages/feeds/Messages';
import TutorsNearMe from './pages/TutorsNearMe';
import StudentsNearMe from './pages/StudentsNearMe';
import Blog from './pages/Blog';
import Admin from './pages/Admin';
import Connect from './pages/Connect';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AwaitingConfirmation from './pages/AwaitingConfirmation';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';
import OnboardingTutor from './pages/onboarding/TutorOnboarding';

// Lazy load heavy components
const LazyBlog = lazy(() => import('./pages/Blog'));
const LazyAdmin = lazy(() => import('./pages/Admin'));
const LazyProfile = lazy(() => import('./pages/Profile'));
const LazyEditProfile = lazy(() => import('./pages/EditProfile'));
const LazyOnboardingTutor = lazy(() => import('./pages/onboarding/TutorOnboarding'));
import { Theme } from './types';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import type { Role } from './types';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/errors/ErrorBoundary';

function App() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Default to system preference; ignore previous localStorage overrides
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Auto-redirect to role-specific feed when logged-in users hit '/'
  const RootRoute = () => {
    const { user } = useContext(AuthContext);
    if (!user) return <Home />;
    const next = (user.active_role as Role) === 'tutor' ? '/feed/tutor' : '/feed/student';
    return <Navigate to={next} replace />;
  };

  // Role-based feed guards
  const TutorOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) return children;
    return (user.active_role as Role) === 'tutor' ? children : <Navigate to="/feed/student" replace />;
  };

  const StudentOnly: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    if (!user) return children;
    return (user.active_role as Role) === 'student' ? children : <Navigate to="/feed/tutor" replace />;
  };

  // Hide public near-me pages for logged-in users of the same role
  const RoleRedirectGate: React.FC<{ blockRole: Role; children: React.ReactElement }> = ({ blockRole, children }) => {
    const { user } = useContext(AuthContext);
    if (user?.active_role === blockRole) {
      const target = blockRole === 'tutor' ? '/feed/tutor' : '/feed/student';
      return <Navigate to={target} replace />;
    }
    return children;
  };

  const FooterVisibility: React.FC = () => {
    const { user } = React.useContext(AuthContext);
    const location = useLocation();
    const inApp = location.pathname.startsWith('/feed') || location.pathname.startsWith('/profile');
    if (user || inApp) return null;
    return <Footer />;
  };

  const TabBarVisibility: React.FC = () => {
    const { user } = React.useContext(AuthContext);
    return user ? <TabBar /> : null;
  };

  const LocationConsentGate: React.FC = () => {
    const { user } = React.useContext(AuthContext);
    const [show, setShow] = useState(false);
    useEffect(() => {
      if (!user) return setShow(false);
      try {
        const dismissed = localStorage.getItem('LOC_CONSENT_DISMISSED') === '1';
        const saved = localStorage.getItem('PREFERRED_LOCATION_NAME');
        setShow(!dismissed && !saved);
      } catch {
        setShow(false);
      }
    }, [user]);

    const accept = () => {
      try { localStorage.setItem('LOC_CONSENT_DISMISSED', '1'); } catch {}
      // Trigger geolocation via a transient event consumed by pages and feeds
      try { window.dispatchEvent(new Event('location:request')); } catch {}
      // Also try capture immediately here to ensure prompt appears
      try {
        if (navigator?.geolocation) {
          navigator.geolocation.getCurrentPosition(() => {}, () => {});
        }
      } catch {}
      setShow(false);
    };
    const dismiss = () => { try { localStorage.setItem('LOC_CONSENT_DISMISSED', '1'); } catch {}; setShow(false); };
    if (!show) return null;
    return <LocationConsent onAccept={accept} onDismiss={dismiss} />;
  };

  // Uniform main spacing wrapper: smaller padding on all pages except landing
  const MainContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const padding = isHome ? 'py-20 md:py-12' : 'py-6 md:py-6';
    return (
      <main className={`flex-grow container mx-auto px-4 sm:px-6 lg:px-8 ${padding}`}>
        {children}
      </main>
    );
  };

  return (
    <HashRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-transparent text-gray-900 dark:text-white">
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#1f2937',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          <ErrorBoundary>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <MainContainer>
              <Suspense fallback={<LoadingSpinner messages={['Loading page...', 'Preparing content...', 'Almost ready...']} />}>
                <Routes>
                  <Route path="/" element={<RootRoute />} />
                  <Route path="/onboarding/tutor" element={<ProtectedRoute><OnboardingTutor /></ProtectedRoute>} />
                  <Route path="/feed/tutor" element={<ProtectedRoute><TutorOnly><TutorsFeed /></TutorOnly></ProtectedRoute>} />
                  <Route path="/feed/student" element={<ProtectedRoute><StudentOnly><StudentsFeed /></StudentOnly></ProtectedRoute>} />
                  <Route path="/feed/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route
                    path="/tutors"
                    element={
                      <RoleRedirectGate blockRole="tutor">
                        <TutorsNearMe />
                      </RoleRedirectGate>
                    }
                  />
                  <Route
                    path="/students"
                    element={
                      <RoleRedirectGate blockRole="student">
                        <StudentsNearMe />
                      </RoleRedirectGate>
                    }
                  />
                  <Route path="/connect" element={<Connect />} />
                  <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/awaiting-confirmation" element={<AwaitingConfirmation />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </MainContainer>
            <FooterVisibility />
            <LocationConsentGate />
            <TabBarVisibility />
          </ErrorBoundary>
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;