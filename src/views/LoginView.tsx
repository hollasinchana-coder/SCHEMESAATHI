import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SCHEMESAATHI_LOGO_URL } from '../data/mockData';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Please enter your phone / mobile number.');
      return;
    }

    setIsLoading(true);
    const res = await login(fullName, phoneNumber);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Failed to log in. Please check your details.');
    }
  };

  const handleFillDemo = () => {
    setFullName('Ramesh Kumar Patil');
    setPhoneNumber('9876543210');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-surface">
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
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            Citizen Portal Login
          </span>
          <p className="text-xs text-on-surface-variant max-w-xs mt-1">
            Enter your name and mobile number to access verified central and state welfare entitlements.
          </p>
        </div>

        {/* Quick Demo Fill */}
        <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-2">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono font-bold text-primary uppercase">Quick Demo Citizen</span>
            <span className="text-xs text-on-surface-variant font-mono">Ramesh Kumar Patil • 9876543210</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3 py-1 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary-container transition-all cursor-pointer whitespace-nowrap"
          >
            Auto-fill
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-error-container text-on-error-container text-xs flex items-center gap-2 border border-error/30 animate-shake">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Clean Login Form: Name + Phone Number ONLY */}
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

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-on-surface flex items-center justify-between">
              <span>Phone Number</span>
              <span className="text-[10px] text-on-surface-variant font-normal">10-Digit Mobile</span>
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px]">
                phone_android
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs font-medium font-mono"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Logging In...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Log In to SchemeSaathi</span>
              </>
            )}
          </button>
        </form>

        {/* DPDP Encryption Note */}
        <div className="pt-2 border-t border-outline-variant/20 text-center flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-mono">
            <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
            <span>256-Bit SSL Encrypted • Aligned with DPDP Act</span>
          </div>
        </div>
      </div>
    </div>
  );
};
