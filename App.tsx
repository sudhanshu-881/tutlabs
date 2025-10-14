import React, { useState, useEffect } from 'react';
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
import Connect from './pages/Connect';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AwaitingConfirmation from './pages/AwaitingConfirmation';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/routing/ProtectedRoute';
import OnboardingTutor from './pages/onboarding/TutorOnboarding';
import { Theme } from './types';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import type { Role } from './types';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Auto-redirect to role-specific feed when logged-in users hit '/'
  const RootRoute = () => {
    const { user } = useContext(AuthContext);
    const [next, setNext] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;
      const check = async () => {
        if (!user?.active_role) {
          if (mounted) setNext(null);
          return;
        }
        if ((user.active_role as Role) === 'tutor') {
          try {
            if (!supabase) {
              if (mounted) setNext('/feed/tutor');
              return;
            }
            const { data } = await supabase
              .from('tutors')
              .select('id')
              .eq('user_id', user.id)
              .single();
            if (mounted) setNext(data?.id ? '/feed/tutor' : '/onboarding/tutor');
          } catch {
            if (mounted) setNext('/feed/tutor');
          }
        } else {
          if (mounted) setNext('/feed/student');
        }
      };
      check();
      return () => { mounted = false; };
    }, [user]);

    if (!user) return <Home />;
    if (!next) return <LoadingSpinner inline={true} />;
    return <Navigate to={next} replace />;
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

  return (
    <HashRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-transparent text-foreground">
          <Toaster position="top-right" />
          <Navbar theme={theme} toggleTheme={toggleTheme} />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-8">
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/onboarding/tutor" element={<ProtectedRoute><OnboardingTutor /></ProtectedRoute>} />
              <Route path="/feed/tutor" element={<ProtectedRoute><TutorsFeed /></ProtectedRoute>} />
              <Route path="/feed/student" element={<ProtectedRoute><StudentsFeed /></ProtectedRoute>} />
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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/awaiting-confirmation" element={<AwaitingConfirmation />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <FooterVisibility />
          <LocationConsentGate />
          <TabBarVisibility />
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;