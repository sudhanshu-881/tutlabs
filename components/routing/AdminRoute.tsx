import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext, supabase } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (loading) { if (mounted) setChecking(true); return; }
      if (!user || !supabase) { if (mounted) { setIsAdmin(false); setChecking(false); } return; }
      try {
        const { data } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .single();
        if (mounted) { setIsAdmin(Boolean(data?.user_id)); setChecking(false); }
      } catch {
        if (mounted) { setIsAdmin(false); setChecking(false); }
      }
    };
    run();
    return () => { mounted = false; };
  }, [user, loading]);

  if (loading || checking) return <LoadingSpinner inline={false} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
