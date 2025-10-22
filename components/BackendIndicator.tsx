import React, { useState, useEffect } from 'react';
import { testBackendConnection } from '../lib/utils/backendTest';

const BackendIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testBackendConnection();
        setIsConnected(result.supabaseConfigured && result.supabaseConnected);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Backend</span>
      </div>
    );
  }

  return (
    <a
      href="/backend-status"
      className={`flex items-center space-x-1 text-xs transition-colors hover:opacity-80 ${
        isConnected 
          ? 'text-green-600 dark:text-green-400' 
          : 'text-red-600 dark:text-red-400'
      }`}
      title={isConnected ? 'Backend connected' : 'Backend disconnected - Click to check status'}
    >
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span>Backend</span>
    </a>
  );
};

export default BackendIndicator;