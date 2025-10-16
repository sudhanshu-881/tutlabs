import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext, supabase } from '../context/AuthContext';
import type { Role } from '../types';
import { getPendingRole, clearPendingRole } from '../lib/services/role';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, phoneSendOtp, phoneVerifyOtp } = useContext(AuthContext);
  const [usePhone, setUsePhone] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Guard direct navigation without role selection, except when redirected from a protected route
  useEffect(() => {
    const pending = getPendingRole();
    const cameFromProtected = Boolean((location as any)?.state?.from);
    if (!pending && !cameFromProtected) {
      window.dispatchEvent(new Event('role:require'));
      try { sessionStorage.setItem('ROLE_REQUIRED', '1'); } catch {}
      navigate('/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (usePhone) {
        if (!otpSent) {
          await phoneSendOtp(phone);
          setOtpSent(true);
          toast.success('📱 OTP sent to your phone! Check your messages.');
          setIsLoading(false);
          return;
        } else {
          await phoneVerifyOtp(phone, otp);
        }
      } else {
        await login(email, password);
      }
      
      setShowSuccess(true);
      toast.success('🎉 Welcome back! Redirecting to your dashboard...');
      const pending = getPendingRole();
      // Strong validation: user must log in as their existing role
      try {
        if (supabase) {
          const { data: u } = await supabase.auth.getUser();
          const uid = u.user?.id;
          if (uid) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('active_role')
              .eq('id', uid)
              .single();
            const currentRole = (profile?.active_role as 'student' | 'tutor') || 'student';
            if (pending && pending !== currentRole) {
              // Logout and force correct selection
              await supabase.auth.signOut();
              setError(`Select your current role: ${currentRole === 'student' ? 'Student/Parent' : 'Tutor'}`);
              toast.error(`Select your current role: ${currentRole === 'student' ? 'Student/Parent' : 'Tutor'}`);
              return;
            }
          }
        }
      } catch {}
      if (pending) {
        clearPendingRole();
      }
      // Redirect based on role; tutors without listing go to onboarding
      try {
        let next: string = '/';
        if (supabase) {
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData.user?.id;
          if (userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('active_role')
              .eq('id', userId)
              .single();
            const role: Role = (profile?.active_role as Role) || 'student';
            if (role === 'tutor') {
              try {
                const { data: tutorRow } = await supabase
                  .from('tutors')
                  .select('id')
                  .eq('user_id', userId)
                  .single();
                next = tutorRow?.id ? '/feed/tutor' : '/onboarding/tutor';
              } catch {
                next = '/feed/tutor';
              }
            } else {
              next = '/feed/student';
            }
          }
        }
        navigate(next);
      } catch {
        navigate('/');
      }
    } catch (err: any) {
      setIsLoading(false);
      setShowSuccess(false);
      
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        const msg = '📧 Please confirm your email address. Check your inbox for a confirmation link.';
        setError(msg);
        toast.error(msg);
      } else if (usePhone && !otpSent) {
        const msg = err.message || '📱 Failed to send OTP. Please check your number.';
        setError(msg);
        toast.error(msg);
      } else if (usePhone && otpSent) {
        const msg = err.message || '🔢 Invalid OTP. Please try again.';
        setError(msg);
        toast.error(msg);
      } else if (err.message && err.message.toLowerCase().includes('invalid login credentials')) {
        const msg = '🔐 Invalid email or password. Please try again.';
        setError(msg);
        toast.error(msg);
      }
      else {
        const msg = err.message || '❌ Failed to sign in. Please check your credentials.';
        setError(msg);
        toast.error(msg);
      }
    }
  };

  if (isLoading && !showSuccess) {
    return <LoadingSpinner type="auth" inline={false} />;
  }

  return (
    <motion.div 
      className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800/50 p-10 rounded-lg shadow-md"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome back! 👋
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ready to continue your learning journey? Or{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              create a new account
            </Link>
          </p>
        </motion.div>
        <motion.form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md border border-red-200 dark:border-red-800"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="rounded-md shadow-sm">
            <motion.div 
              className="flex items-center justify-center gap-3 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <motion.button 
                type="button" 
                onClick={() => setUsePhone(false)} 
                className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${!usePhone ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📧 Email
              </motion.button>
              <motion.button 
                type="button" 
                onClick={() => setUsePhone(true)} 
                className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${usePhone ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📱 Phone
              </motion.button>
            </motion.div>
            {!usePhone ? (
              <>
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address *</label>
                  <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:z-10 sm:text-sm" placeholder="Email address" />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password *</label>
                  <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:z-10 sm:text-sm" placeholder="Password" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="phone" className="sr-only">Phone *</label>
                  <input id="phone" name="phone" type="tel" inputMode="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:z-10 sm:text-sm" placeholder="Phone (with country code)" />
                </div>
                {otpSent && (
                  <div className="mt-2">
                    <label htmlFor="otp" className="sr-only">OTP *</label>
                    <input id="otp" name="otp" type="text" inputMode="numeric" required value={otp} onChange={(e) => setOtp(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:z-10 sm:text-sm" placeholder="Enter OTP" />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={async () => {
                  setError('');
                  try {
                    if (!email) {
                      setError('Enter your email above to receive a reset link.');
                      return;
                    }
                    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
                      redirectTo: window.location.origin + '/#/reset-password'
                    });
                    if (error) throw error;
                    toast.success('Password reset link sent to your email.');
                  } catch (e: any) {
                    const msg = e?.message || 'Failed to send reset link. Try again.';
                    setError(msg);
                    toast.error(msg);
                  }
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <motion.button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              animate={isLoading ? { scale: [1, 1.02, 1] } : {}}
              transition={isLoading ? { duration: 1, repeat: Infinity } : {}}
            >
              <motion.span
                className="flex items-center gap-2"
                animate={isLoading ? { opacity: [1, 0.7, 1] } : {}}
                transition={isLoading ? { duration: 1, repeat: Infinity } : {}}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Signing you in...
                  </>
                ) : (
                  <>
                    🚀 Sign in
                  </>
                )}
              </motion.span>
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default Login;