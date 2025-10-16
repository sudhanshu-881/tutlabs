import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { supabase } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      // Skip check while auth loading
      if (loading) { if (mounted) setChecking(true); return; }
      // Allow unauthenticated guard to trigger
      if (!user) { if (mounted) { setChecking(false); setNeedsOnboarding(false); } return; }
      // Allow onboarding page itself
      if (location.pathname.startsWith('/onboarding/tutor')) { if (mounted) { setChecking(false); setNeedsOnboarding(false); } return; }
      // Only enforce for tutors
      if ((user.active_role as any) === 'tutor') {
        try {
          if (!supabase) { if (mounted) { setChecking(false); setNeedsOnboarding(false); } return; }
          const { data } = await supabase
            .from('tutors')
            .select('id')
            .eq('user_id', user.id)
            .single();
          if (mounted) setNeedsOnboarding(!data?.id);
        } catch {
          if (mounted) setNeedsOnboarding(false);
        } finally {
          if (mounted) setChecking(false);
        }
      } else {
        if (mounted) { setNeedsOnboarding(false); setChecking(false); }
      }
    };
    run();
    return () => { mounted = false; };
  }, [user, loading, location.pathname]);

  if (loading || checking) {
    return <LoadingSpinner type="auth" inline={false} />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding/tutor" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
