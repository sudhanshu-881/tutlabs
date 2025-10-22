import React, { useState, useEffect } from 'react';

interface DiagnosticResult {
  environmentVariables: {
    supabaseUrl: string | undefined;
    supabaseKey: string | undefined;
    contactEmail: string | undefined;
  };
  supabaseConnection: {
    configured: boolean;
    urlValid: boolean;
    keyValid: boolean;
  };
  errors: string[];
  recommendations: string[];
}

const ProductionDiagnostic: React.FC = () => {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostic = async () => {
      const result: DiagnosticResult = {
        environmentVariables: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          contactEmail: import.meta.env.VITE_CONTACT_EMAIL,
        },
        supabaseConnection: {
          configured: false,
          urlValid: false,
          keyValid: false,
        },
        errors: [],
        recommendations: [],
      };

      // Check if environment variables are loaded
      if (result.environmentVariables.supabaseUrl && result.environmentVariables.supabaseKey) {
        result.supabaseConnection.configured = true;
        
        // Validate URL format
        if (result.environmentVariables.supabaseUrl.includes('supabase.co') && 
            result.environmentVariables.supabaseUrl.startsWith('https://')) {
          result.supabaseConnection.urlValid = true;
        } else {
          result.errors.push('Supabase URL format is invalid');
          result.recommendations.push('Check VITE_SUPABASE_URL in Vercel environment variables');
        }

        // Validate API key format
        if (result.environmentVariables.supabaseKey.startsWith('eyJ') && 
            result.environmentVariables.supabaseKey.length > 100) {
          result.supabaseConnection.keyValid = true;
        } else {
          result.errors.push('Supabase API key format is invalid');
          result.recommendations.push('Check VITE_SUPABASE_ANON_KEY in Vercel environment variables');
        }
      } else {
        result.errors.push('Environment variables not loaded');
        result.recommendations.push('Check Vercel environment variables are set correctly');
        result.recommendations.push('Redeploy your Vercel app after setting environment variables');
      }

      // Check if we're in production
      const isProduction = window.location.hostname !== 'localhost' && 
                          !window.location.hostname.includes('127.0.0.1');
      
      if (isProduction) {
        result.recommendations.push('This is a production environment - environment variables should be loaded from Vercel');
      } else {
        result.recommendations.push('This is a local environment - check your .env.local file');
      }

      setDiagnostic(result);
      setLoading(false);
    };

    runDiagnostic();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-600 dark:text-blue-400">Running diagnostic...</span>
        </div>
      </div>
    );
  }

  if (!diagnostic) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-sm text-red-600 dark:text-red-400">
          Failed to run diagnostic
        </div>
      </div>
    );
  }

  const allGood = diagnostic.supabaseConnection.configured && 
                  diagnostic.supabaseConnection.urlValid && 
                  diagnostic.supabaseConnection.keyValid;

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${allGood ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-4 h-4 rounded-full ${allGood ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${allGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            Production Backend {allGood ? 'Configured' : 'Issues Detected'}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Environment Variables Loaded:</span>
            <span className={diagnostic.supabaseConnection.configured ? 'text-green-600' : 'text-red-600'}>
              {diagnostic.supabaseConnection.configured ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Supabase URL Valid:</span>
            <span className={diagnostic.supabaseConnection.urlValid ? 'text-green-600' : 'text-red-600'}>
              {diagnostic.supabaseConnection.urlValid ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">API Key Valid:</span>
            <span className={diagnostic.supabaseConnection.keyValid ? 'text-green-600' : 'text-red-600'}>
              {diagnostic.supabaseConnection.keyValid ? '✅ Yes' : '❌ No'}
            </span>
          </div>
        </div>
      </div>

      {diagnostic.errors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Issues Found:</h3>
          <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
            {diagnostic.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {diagnostic.recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Recommendations:</h3>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            {diagnostic.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Environment Variables Debug:</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>VITE_SUPABASE_URL: {diagnostic.environmentVariables.supabaseUrl ? 'Set' : 'Not set'}</div>
          <div>VITE_SUPABASE_ANON_KEY: {diagnostic.environmentVariables.supabaseKey ? 'Set' : 'Not set'}</div>
          <div>VITE_CONTACT_EMAIL: {diagnostic.environmentVariables.contactEmail ? 'Set' : 'Not set'}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDiagnostic;