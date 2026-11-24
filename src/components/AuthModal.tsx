import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle, ShieldCheck, Clock } from 'lucide-react';
import { api, type User } from '../services/api';
import { NduCrest } from './NduCrest';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.auth.login(email, password);
        if (res.success && res.user) {
          setSuccessMsg('Authenticated successfully!');
          setTimeout(() => {
            onSuccess(res.user);
            onClose();
          }, 400);
        } else if (res.isPendingVerification) {
          setShowPendingModal(true);
        } else {
          setError(res.message || 'Login failed. Please verify your credentials.');
        }
      } else {
        const res = await api.auth.register(fullName, email, password);
        if (res.success && res.pendingVerification) {
          // Display the Account created / Waiting for admin verification popup modal
          // Do NOT redirect the user to dashboard!
          setShowPendingModal(true);
        } else if (res.success && res.user && res.token) {
          setSuccessMsg('Account created successfully!');
          setTimeout(() => {
            onSuccess(res.user);
            onClose();
          }, 500);
        } else {
          setError(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error connecting to library portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#14452F] text-white">
          <div className="flex items-center gap-2.5">
            <NduCrest className="h-8 w-auto" />
            <div>
              <h2 className="font-serif text-base font-bold tracking-tight text-white leading-tight">
                NDU Research &amp; Library Portal
              </h2>
              <p className="text-[11px] text-amber-200">
                {showPendingModal
                  ? 'Registration Under Review'
                  : mode === 'login'
                  ? 'Authorized Member & Admin Login'
                  : 'New Researcher Registration'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pending Verification Notice View */}
        {showPendingModal ? (
          <div className="p-7 sm:p-8 text-center space-y-6 animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 border-2 border-amber-300 shadow-xs">
              <Clock className="h-8 w-8 animate-pulse text-amber-700" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
                Account created
              </h3>
              <p className="text-base sm:text-lg font-bold text-[#14452F]">
                waiting for admin verification
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-600 leading-relaxed text-left space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
                <ShieldCheck className="h-4 w-4 text-[#14452F] shrink-0" />
                <span>Verification Request Dispatched</span>
              </div>
              <p>
                A notification has been sent to the University Library Administrator to verify your researcher credentials and academic profile.
              </p>
              <p className="text-[11px] text-stone-500 pt-1.5 border-t border-stone-200">
                You will not be directed to your researcher dashboard until the admin approves your account from the dashboard. Once verified, you may sign in with your email and password.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPendingModal(false);
                  setMode('login');
                  setPassword('');
                  onClose();
                }}
                className="w-full rounded-lg bg-[#14452F] py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#0D3121] active:scale-[0.99] transition-all cursor-pointer"
              >
                Return to Library Home
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <div className="p-6 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 p-3 text-xs rounded-lg bg-red-50 text-red-800 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 p-3 text-xs rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Full Name &amp; Title
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Joyce C. Oyadonghan"
                      className="w-full rounded-md border border-stone-300 pl-9 pr-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B3B69] focus:ring-1 focus:ring-[#0B3B69] outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@ndu.edu.ng"
                    className="w-full rounded-md border border-stone-300 pl-9 pr-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B3B69] focus:ring-1 focus:ring-[#0B3B69] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-stone-300 pl-9 pr-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#0B3B69] focus:ring-1 focus:ring-[#0B3B69] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-md bg-[#14452F] py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0D3121] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'login'
                  ? 'Sign In to Portal'
                  : 'Create Researcher Account'}
              </button>
            </form>

            {/* Toggle mode */}
            <div className="pt-2 text-center text-xs text-stone-600 border-t border-stone-100">
              {mode === 'login' ? (
                <p>
                  Need to submit a research manuscript?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                    }}
                    className="font-semibold text-[#0B3B69] hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="font-semibold text-[#0B3B69] hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
