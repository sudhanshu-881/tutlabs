import React, { useState, useEffect } from 'react';
import { testBackendConnection, BackendTestResult } from '../lib/utils/backendTest';

interface BackendStatusProps {
  showDetails?: boolean;
  className?: string;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [status, setStatus] = useState<BackendTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const result = await testBackendConnection();
        setStatus(result);
      } catch (error) {
        console.error('Backend test failed:', error);
        setStatus({
          supabaseConfigured: false,
          supabaseConnected: false,
          environmentVariables: {
            supabaseUrl: undefined,
            supabaseAnonKey: undefined,
            contactEmail: undefined,
          },
          errors: ['Failed to test backend connection'],
          recommendations: ['Check your internet connection and try again'],
        });
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  if (loading) {
    return (
      <div className={`p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-600 dark:text-blue-400">Checking backend connection...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/20 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm text-red-600 dark:text-red-400">Unable to check backend status</span>
        </div>
      </div>
    );
  }

  const isHealthy = status.supabaseConfigured && status.supabaseConnected;

  return (
    <div className={`p-4 rounded-lg ${isHealthy 
      ? 'bg-green-50 dark:bg-green-900/20' 
      : 'bg-red-50 dark:bg-red-900/20'
    } ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className={`w-4 h-4 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`text-sm font-medium ${isHealthy 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
        }`}>
          Backend {isHealthy ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {showDetails && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div>Supabase: {status.supabaseConfigured ? '✅ Configured' : '❌ Not configured'}</div>
            <div>Connection: {status.supabaseConnected ? '✅ Active' : '❌ Failed'}</div>
          </div>

          {status.errors.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Errors:</div>
              <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                {status.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {status.recommendations.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Recommendations:</div>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                {status.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackendStatus;