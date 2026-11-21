import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.auth.login(email, password);
        if (res.success) {
          setSuccessMsg('Authenticated successfully!');
          setTimeout(() => {
            onSuccess(res.user);
            onClose();
          }, 400);
        } else {
          setError(res.message || 'Login failed. Please verify your credentials.');
        }
      } else {
        const res = await api.auth.register(fullName, email, password);
        if (res.success) {
          setSuccessMsg('Account created successfully! Signing in...');
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

  const handleQuickDemo = async (role: 'admin' | 'researcher') => {
    setError(null);
    setLoading(true);
    const demoEmail = role === 'admin' ? 'admin@ndu.edu.ng' : 'researcher@ndu.edu.ng';
    const demoPassword = role === 'admin' ? 'Admin@123' : 'Member@123';
    setEmail(demoEmail);
    setPassword(demoPassword);

    try {
      const res = await api.auth.login(demoEmail, demoPassword);
      if (res.success) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Demo login failed');
      }
    } catch (err: any) {
      setError('Could not connect to authentication service.');
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
                {mode === 'login' ? 'Authorized Member & Admin Login' : 'New Researcher Registration'}
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

        {/* Form Body */}
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

          {/* Quick Demo Credentials Box */}
          <div className="rounded-lg bg-stone-50 p-3 border border-stone-200 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5 text-[#14452F]" />
              <span>Instant Test &amp; Demo Access:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="px-2.5 py-1.5 rounded border border-stone-300 bg-white font-medium text-stone-800 hover:bg-stone-100 hover:border-[#14452F] text-left cursor-pointer transition-colors"
              >
                <span className="block font-bold text-[#14452F]">Login as Admin</span>
                <span className="text-[10px] text-stone-500">Full System Control</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('researcher')}
                className="px-2.5 py-1.5 rounded border border-stone-300 bg-white font-medium text-stone-800 hover:bg-stone-100 hover:border-[#0B3B69] text-left cursor-pointer transition-colors"
              >
                <span className="block font-bold text-[#0B3B69]">Login as Member</span>
                <span className="text-[10px] text-stone-500">Dr. Ebiere Tari</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
