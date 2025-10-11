import React, { createContext, useState, useEffect } from 'react';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';

// TODO: In a production application with a build step (like Vite or Create React App),
// these credentials should be stored in environment variables (e.g., .env file) and
// accessed via `process.env`. Since this is a static setup, we'll place them here directly.
const supabaseUrl = 'https://cetzjrdsjefzqkfdzxwo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldHpqcmRzamVmenFrZmR6eHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTUwOTcsImV4cCI6MjA3NTY3MTA5N30.KXF5YV61x6J4T1Qozry8Ju7JxmN8lcvSkH9Ny74u0oE';

let supabase: SupabaseClient | null = null;

// Initialize Supabase client only if credentials are provided to prevent app crash
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // This message is for the developer. It's safe to leave in.
  console.warn("Supabase URL and Anon Key are not set. Please update them in context/AuthContext.tsx to connect to your Supabase project. Authentication features will be disabled.");
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Supabase is not configured, we can't check for a session.
    if (!supabase) {
      setLoading(false);
      return;
    }
  
    const setSessionUser = (session: Session | null) => {
      const supabaseUser = session?.user;
      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata.full_name || supabaseUser.email?.split('@')[0] || 'User',
        });
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

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error("Authentication is currently unavailable. Please try again later.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };
  
  const signup = async (name: string, email: string, password: string) => {
    if (!supabase) throw new Error("Authentication is currently unavailable. Please try again later.");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { supabase };