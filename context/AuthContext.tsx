import React, { createContext, useState, useEffect } from 'react';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { Role } from '../types';
import { reverseGeocode } from '../utils/geocoding';

// --- SECURITY BEST PRACTICE ---
// Credentials are now loaded from Vite's environment variables. This is a critical security measure
// to prevent exposing sensitive keys in the client-side source code.
//
// In your hosting environment (e.g., Vercel), you must set the following
// environment variables for the application to connect to Supabase:
// - VITE_SUPABASE_URL: Your Supabase project URL.
// - VITE_SUPABASE_ANON_KEY: Your Supabase project's public "anon" key.
//
// Your app's security relies on Supabase's Row Level Security (RLS) being enabled and
// correctly configured for every table. The 'anon' key is public and client-safe ONLY if
// you have secured your database with RLS.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


let supabase: SupabaseClient | null = null;

// Initialize Supabase client only if credentials are provided to prevent app crash
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // This message is for the developer. It's safe to leave in.
  console.warn("Supabase URL and Anon Key are not set as environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect to your Supabase project. Authentication features will be disabled.");
}

interface User {
  id: string;
  name: string;
  email: string;
  active_role: Role | null;
  preferred_location?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: Role) => Promise<void>;
  phoneSendOtp: (phone: string, fullName?: string) => Promise<void>;
  phoneVerifyOtp: (phone: string, token: string) => Promise<void>;
  loading: boolean;
  roleSwitching: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  switchRole: async () => {},
  phoneSendOtp: async () => {},
  phoneVerifyOtp: async () => {},
  loading: true,
  roleSwitching: false,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleSwitching, setRoleSwitching] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
  
    const getProfileAndSetUser = async (sessionUser: any) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, active_role, preferred_location')
          .eq('id', sessionUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // Determine effective role: if user has a tutor listing, treat as tutor
        let effectiveRole: Role = (profile?.active_role as Role) || 'student';
        try {
          const { data: trow } = await supabase
            .from('tutors')
            .select('id')
            .eq('user_id', sessionUser.id)
            .maybeSingle();
          if (trow?.id) effectiveRole = 'tutor';
        } catch {}

        setUser({
          id: sessionUser.id,
          email: sessionUser.email || '',
          name: profile?.full_name || sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
          active_role: effectiveRole,
          preferred_location: (profile as any)?.preferred_location || null,
        });

      } catch (error) {
        console.error("Error fetching profile, falling back to session data:", error);
        setUser({
          id: sessionUser.id,
          email: sessionUser.email || '',
          name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'User',
          active_role: 'student', // Fallback role
          preferred_location: null,
        });
      }
    };

    const setSessionUser = async (session: Session | null) => {
      if (session?.user) {
        await getProfileAndSetUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Check for an existing session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session);
    });
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Capture user location shortly after login for location-based feeds
  useEffect(() => {
    if (!user) return;
    // Skip if already captured recently (24h)
    try {
      const ts = Number(localStorage.getItem('PREFERRED_LOCATION_TS') || '0');
      if (ts && Date.now() - ts < 24 * 60 * 60 * 1000) return;
    } catch {}

    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          localStorage.setItem('PREFERRED_LOCATION_NAME', name);
          localStorage.setItem('PREFERRED_LOCATION_TS', String(Date.now()));
          if (supabase) {
            try {
              await supabase
                .from('profiles')
                .update({ preferred_location: name, updated_at: new Date() })
                .eq('id', user!.id);
            } catch {}
          }
        } catch {}
      },
      () => {
        // ignore errors silently here; users can manually use "near me" later
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  }, [user]);

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error("Authentication is currently unavailable. Please try again later.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };
  
  // SECURITY NOTE: The `profiles` table must have Row Level Security enabled.
  // After a user signs up, a trigger/function in Supabase should create a corresponding
  // public.profiles row. The RLS policy should ensure users can only see and edit their own profile.
  // Example Policy:
  // CREATE POLICY "Users can insert their own profile"
  // ON public.profiles FOR INSERT
  // WITH CHECK (auth.uid() = id);
  const signup = async (name: string, email: string, password: string) => {
    if (!supabase) throw new Error("Authentication is currently unavailable. Please try again later.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: window.location.origin,
      }
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
  };

  const phoneSendOtp = async (phone: string, fullName?: string) => {
    if (!supabase) throw new Error("Authentication is currently unavailable. Please try again later.");
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
        data: fullName ? { full_name: fullName } : undefined,
        shouldCreateUser: true,
      }
    });
    if (error) throw new Error(error.message);
  };

  const phoneVerifyOtp = async (phone: string, token: string) => {
    if (!supabase) throw new Error("Authentication is currently unavailable. Please try again later.");
    const { error } = await supabase.auth.verifyOtp({ type: 'sms', phone, token });
    if (error) throw new Error(error.message);
  };

  const switchRole = async (newRole: Role) => {
    if (!supabase || !user || roleSwitching) return;
    setRoleSwitching(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ active_role: newRole, updated_at: new Date() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser(prevUser => prevUser ? { ...prevUser, active_role: newRole } : null);
    } catch (error: any) {
      console.error("Error switching role:", error);
      alert('Failed to switch role. Please try again.');
    } finally {
      setRoleSwitching(false);
    }
  };

  useEffect(() => {
    // Surface preferred_location globally for quick access by non-context code paths
    try {
      if (user?.preferred_location) {
        (window as any).__AUTH_PREFERRED_LOCATION__ = user.preferred_location;
      } else {
        delete (window as any).__AUTH_PREFERRED_LOCATION__;
      }
    } catch {}
  }, [user?.preferred_location]);

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    switchRole,
    roleSwitching,
    phoneSendOtp,
    phoneVerifyOtp,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { supabase };