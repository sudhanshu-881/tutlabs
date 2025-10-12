import React, { useEffect, useState } from 'react';
import { supabase } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        if (!supabase) throw new Error('Auth service unavailable');

        const url = new URL(window.location.href);
        const searchParams = url.searchParams;
        const hash = window.location.hash || '';
        const hashQueryIndex = hash.indexOf('?');
        const hashQueryString = hashQueryIndex >= 0 ? hash.substring(hashQueryIndex + 1) : '';
        const hashParams = new URLSearchParams(hashQueryString);

        const code = searchParams.get('code') || hashParams.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setError('Invalid or expired reset link. Please request a new one.');
        } else {
          setSessionReady(true);
        }
      } catch (e: any) {
        setError(e?.message || 'Invalid or expired reset link.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (!supabase) throw new Error('Auth service unavailable');
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Auth session missing. Please use a valid reset link.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      if (password !== confirm) throw new Error('Passwords do not match.');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated. Please sign in.');
      navigate('/login');
    } catch (e: any) {
      const msg = e?.message || 'Failed to update password.';
      setError(msg);
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white/90 dark:bg-gray-900/70 backdrop-blur rounded-lg shadow p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset your password</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Enter a new password for your account.</p>
      {error && <p className="mt-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm dark:bg-gray-700 dark:text-white" required disabled={!sessionReady} />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm password</label>
          <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 sm:text-sm dark:bg-gray-700 dark:text-white" required disabled={!sessionReady} />
        </div>
        <button type="submit" className="w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={!sessionReady}>Update password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
