import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SCHEMESAATHI_LOGO_URL } from '../data/mockData';

interface SignupViewProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onSuccess, onNavigateToLogin }) => {
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!emailOrPhone.trim()) {
      setError('Please enter your email or 10-digit mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setIsLoading(true);
    const res = await signup(fullName, emailOrPhone, password);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to create citizen account. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-surface">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-xl border border-outline-variant/30 flex flex-col gap-6 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2">
            <img
              src={SCHEMESAATHI_LOGO_URL}
              alt="SchemeSaathi Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-2xl font-black text-primary tracking-tight">SchemeSaathi</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary-fixed/30 text-primary text-[11px] font-mono font-bold">
            <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
            Citizen Portal Registration
          </span>
          <p className="text-xs text-on-surface-variant max-w-xs mt-1">
            Create your account to discover personalized entitlements, track DBT direct benefits, and access the multi-lingual AI assistant.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-error-container text-on-error-container text-xs flex items-center gap-2 border border-error/30 animate-shake">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface flex items-center justify-between">
              <span>Full Name</span>
              <span className="text-[10px] text-on-surface-variant font-normal">As per Aadhaar/Voter ID</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px]">
                badge
              </span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar Patil"
                required
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs font-medium"
              />
            </div>
          </div>

          {/* Email or Mobile Number */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface flex items-center justify-between">
              <span>Email or Mobile Number</span>
              <span className="text-[10px] text-on-surface-variant font-normal">For OTP & scheme alerts</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px]">
                contact_phone
              </span>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="e.g. 9876543210 or citizen@example.com"
                required
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface flex items-center justify-between">
              <span>Password</span>
              <span className="text-[10px] text-on-surface-variant font-normal">Min 6 characters</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                minLength={6}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-on-surface-variant hover:text-on-surface cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface">Confirm Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px]">
                lock_clock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                minLength={6}
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs font-medium"
              />
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-1 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation to Login */}
        <div className="pt-2 border-t border-outline-variant/20 text-center flex flex-col items-center gap-2">
          <p className="text-xs text-on-surface-variant">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Log In
            </button>
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-mono mt-1">
            <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
            <span>256-Bit SSL Encrypted • Aligned with DPDP Act</span>
          </div>
        </div>
      </div>
    </div>
  );
};
