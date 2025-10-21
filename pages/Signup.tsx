import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { setPendingRole, getPendingRole, clearPendingRole } from '../lib/services/role';
import toast from 'react-hot-toast';
import { useFormValidation, commonRules } from '../hooks/useFormValidation';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usePhone, setUsePhone] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const { signup, switchRole, phoneSendOtp, phoneVerifyOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const validationRules = {
    name: commonRules.name,
    email: commonRules.email,
    password: {
      ...commonRules.password,
      custom: (value: string) => {
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        return null;
      },
    },
    phone: commonRules.phone,
    otp: {
      required: true,
      pattern: /^\d{6}$/,
      message: 'OTP must be 6 digits',
    },
  };

  const { errors, validateField, validateForm, clearError, clearAllErrors } = useFormValidation(validationRules);

  // Guard against starting signup without role on mobile/direct link
  useEffect(() => {
    const pending = getPendingRole();
    if (!pending) {
      window.dispatchEvent(new Event('role:require'));
      try { sessionStorage.setItem('ROLE_REQUIRED', '1'); } catch {}
      navigate('/');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearAllErrors();
    
    try {
      if (usePhone) {
        if (!otpSent) {
          // Validate name and phone before sending OTP
          const nameError = validateField('name', name);
          const phoneError = validateField('phone', phone);
          if (nameError || phoneError) {
            setError('Please fix the errors below');
            return;
          }
          await phoneSendOtp(phone, name);
          setOtpSent(true);
          return;
        } else {
          // Validate OTP before verifying
          const otpError = validateField('otp', otp);
          if (otpError) {
            setError(otpError);
            return;
          }
          await phoneVerifyOtp(phone, otp);
          const pending = getPendingRole();
          if (pending) {
            try { await switchRole(pending); } finally { clearPendingRole(); }
          } else {
            setError('Select your current role: Student/Parent or Tutor');
            toast.error('Select your current role: Student/Parent or Tutor');
            return;
          }
          navigate('/');
          return;
        }
      } else {
        // Validate all fields
        const formData = { name, email, password };
        if (!validateForm(formData)) {
          setError('Please fix the errors below');
          return;
        }
        await signup(name, email, password);
        const pending = getPendingRole();
        if (pending) {
          try {
            await switchRole(pending);
          } finally {
            clearPendingRole();
          }
        } else {
          setError('Select your current role: Student/Parent or Tutor');
          toast.error('Select your current role: Student/Parent or Tutor');
          return;
        }
        navigate('/awaiting-confirmation', { state: { email } });
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to create an account. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800/50 p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm">
            <div className="flex items-center justify-center gap-3 mb-3">
              <button type="button" onClick={() => setUsePhone(false)} className={`px-3 py-1 rounded-md text-sm ${!usePhone ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Email</button>
              <button type="button" onClick={() => setUsePhone(true)} className={`px-3 py-1 rounded-md text-sm ${usePhone ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Phone</button>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                autoComplete="name" 
                required 
                maxLength={100} 
                value={name} 
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
                onBlur={() => validateField('name', name)}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:z-10 sm:text-sm`} 
                placeholder="Enter your full name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            {!usePhone ? (
              <>
                <div className="mt-2">
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email address *</label>
                  <input 
                    id="email-address" 
                    name="email" 
                    type="email" 
                    autoComplete="email" 
                    required 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError('email');
                    }}
                    onBlur={() => validateField('email', email)}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:z-10 sm:text-sm`} 
                    placeholder="Enter your email address"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="mt-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    autoComplete="new-password" 
                    required 
                    value={password} 
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError('password');
                    }}
                    onBlur={() => validateField('password', password)}
                    className={`appearance-none relative block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:z-10 sm:text-sm`} 
                    placeholder="Create a strong password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                      {errors.password}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 6 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mt-2">
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

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0 active:shadow-md"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;