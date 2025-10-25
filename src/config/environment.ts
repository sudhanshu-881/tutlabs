// Environment configuration for production deployment
// This file handles missing environment variables gracefully

interface EnvironmentConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  appName: string;
  appVersion: string;
  environment: string;
  isProduction: boolean;
  isDevelopment: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || null;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || null;
  
  return {
    supabaseUrl,
    supabaseAnonKey,
    appName: import.meta.env.VITE_APP_NAME || 'TutLabs',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.1',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'production',
    isProduction: import.meta.env.PROD || false,
    isDevelopment: import.meta.env.DEV || true,
  };
};

export const env = getEnvironmentConfig();

// Log environment status (only in development)
if (env.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    appName: env.appName,
    appVersion: env.appVersion,
    environment: env.environment,
    hasSupabase: !!(env.supabaseUrl && env.supabaseAnonKey),
    isProduction: env.isProduction,
  });
}

// Warn about missing Supabase configuration
if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. App will run in demo mode.');
  console.warn('To enable full functionality, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}
