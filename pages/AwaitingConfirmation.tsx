import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../context/AuthContext';

const AwaitingConfirmation: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email;
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      setError("Could not find an email address. Please go back and try signing up again.");
      return;
    }
    if (!supabase) {
      setError("Authentication service is not available.");
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://www.tutlabs.in',
        }
      });
      
      if (resendError) {
        throw resendError;
      }

      setMessage('A new confirmation link has been sent to your email address.');
    } catch (err: any) {
        setError(err.message || 'An error occurred while resending the link. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-white dark:bg-gray-800/50 p-10 rounded-lg shadow-md">
        <div>
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mx-auto">
            <ion-icon name="mail-unread-outline" className="text-3xl text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Confirm your email
          </h2>
          <p className="mt-2 text-center text-md text-gray-600 dark:text-gray-400">
            We've sent a confirmation link to {email ? <strong>{email}</strong> : 'your email address'}. Please click the link to activate your account.
          </p>
        </div>
        <div className="mt-6">
            {message && <p className="text-sm text-green-600 bg-green-100 dark:bg-green-900/50 p-3 rounded-md mb-4">{message}</p>}
            {error && <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Didn't receive an email? Check your spam folder or{' '}
                <button 
                  onClick={handleResend} 
                  disabled={loading}
                  className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Sending...' : 'resend confirmation link'}
                </button>.
            </p>
        </div>
        <div className="mt-8">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              &larr; Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default AwaitingConfirmation;
