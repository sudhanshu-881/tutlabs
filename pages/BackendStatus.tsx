import React, { useState, useEffect } from 'react';
import { testBackendConnection, generateBackendSetupInstructions } from '../lib/utils/backendTest';
import { testProductionBackend, generateProductionReport } from '../lib/utils/productionTest';
import BackendStatus from '../components/BackendStatus';

const BackendStatusPage: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [productionStatus, setProductionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showProductionReport, setShowProductionReport] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const [basicResult, productionResult] = await Promise.all([
          testBackendConnection(),
          testProductionBackend()
        ]);
        setStatus(basicResult);
        setProductionStatus(productionResult);
      } catch (error) {
        console.error('Backend test failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);

  const handleRetest = async () => {
    setLoading(true);
    try {
      const result = await testBackendConnection();
      setStatus(result);
    } catch (error) {
      console.error('Backend test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Checking backend connection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Backend Connection Status
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Check your backend configuration and connection status
          </p>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Connection Status
              </h2>
              <button
                onClick={handleRetest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retest Connection
              </button>
            </div>
            
            <BackendStatus showDetails={true} />
          </div>

          {/* Environment Variables */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Environment Variables
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-medium text-gray-900 dark:text-white">VITE_SUPABASE_URL</span>
                <span className={`text-sm ${status?.environmentVariables?.supabaseUrl ? 'text-green-600' : 'text-red-600'}`}>
                  {status?.environmentVariables?.supabaseUrl ? '✅ Set' : '❌ Not set'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-medium text-gray-900 dark:text-white">VITE_SUPABASE_ANON_KEY</span>
                <span className={`text-sm ${status?.environmentVariables?.supabaseAnonKey ? 'text-green-600' : 'text-red-600'}`}>
                  {status?.environmentVariables?.supabaseAnonKey ? '✅ Set' : '❌ Not set'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-medium text-gray-900 dark:text-white">VITE_CONTACT_EMAIL</span>
                <span className={`text-sm ${status?.environmentVariables?.contactEmail ? 'text-green-600' : 'text-yellow-600'}`}>
                  {status?.environmentVariables?.contactEmail ? '✅ Set' : '⚠️ Optional'}
                </span>
              </div>
            </div>
          </div>

          {/* Production Status */}
          {productionStatus && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Production Status
                </h2>
                <button
                  onClick={() => setShowProductionReport(!showProductionReport)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {showProductionReport ? 'Hide' : 'Show'} Report
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">Environment</span>
                  <span className={`text-sm ${productionStatus.environmentDetected ? 'text-green-600' : 'text-yellow-600'}`}>
                    {productionStatus.environmentDetected ? '✅ Production' : '⚠️ Development'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">Database Access</span>
                  <span className={`text-sm ${productionStatus.databaseAccessible ? 'text-green-600' : 'text-red-600'}`}>
                    {productionStatus.databaseAccessible ? '✅ Accessible' : '❌ Not Accessible'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium text-gray-900 dark:text-white">Authentication</span>
                  <span className={`text-sm ${productionStatus.authenticationWorking ? 'text-green-600' : 'text-red-600'}`}>
                    {productionStatus.authenticationWorking ? '✅ Working' : '❌ Not Working'}
                  </span>
                </div>
              </div>

              {showProductionReport && (
                <div className="mt-4">
                  <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
                    {generateProductionReport(productionStatus)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Setup Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Setup Instructions
              </h2>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                {showInstructions ? 'Hide' : 'Show'} Instructions
              </button>
            </div>
            
            {showInstructions && (
              <div className="prose dark:prose-invert max-w-none">
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                  {generateBackendSetupInstructions()}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">Create Supabase Project</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Set up a new Supabase project for your backend
                </p>
              </a>
              
              <a
                href="/"
                className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">Back to App</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Return to the main application
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusPage;