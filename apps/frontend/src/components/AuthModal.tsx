'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Shield, KeyRound, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchApi, setAuthToken } from '@/lib/api';
import { User, Role } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'otp';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>(initialMode);
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const res = await fetchApi('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setAuthToken(res.token);
        onSuccess(res.user);
        onClose();
      } else if (mode === 'register') {
        const res = await fetchApi('/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role }),
        });
        setAuthToken(res.token);
        onSuccess(res.user);
        onClose();
      } else if (mode === 'otp') {
        if (otpStep === 'request') {
          const res = await fetchApi('/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
          });
          setSuccessMsg('OTP code sent successfully. Valid for 10 minutes.');
          if (res.debug_otp) setDebugOtp(res.debug_otp);
          setOtpStep('verify');
        } else {
          await fetchApi('/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, otp: otpCode, password }),
          });
          setSuccessMsg('Password reset successful! You can now log in.');
          setTimeout(() => {
            setMode('login');
            setOtpStep('request');
            setSuccessMsg(null);
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700/80 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
            {mode === 'otp' ? <KeyRound className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'login' && 'Sign In to CyberCMS'}
            {mode === 'register' && 'Create Academic Account'}
            {mode === 'otp' && (otpStep === 'request' ? 'Password Reset OTP' : 'Verify OTP & Reset Password')}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login' && 'Enter your credentials to access your dashboard'}
            {mode === 'register' && 'Join your academic department or course platform'}
            {mode === 'otp' && (otpStep === 'request' ? 'Receive a 10-minute single-use OTP code' : 'Enter the 6-digit code and your new password')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-emerald-400 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p>{successMsg}</p>
              {debugOtp && (
                <p className="font-mono mt-1 text-amber-300 font-bold">Generated OTP Preview: {debugOtp}</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>

              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice Johnson"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {(mode !== 'otp' || (mode === 'otp' && otpStep === 'request')) && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@institution.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Select Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="STUDENT">Academic Student (Requires Mentor ID)</option>
                <option value="PAID_USER">Paid Course Member</option>
                <option value="STAFF">Department Staff / Mentor</option>
              </select>
            </div>
          )}

          {(mode === 'login' || mode === 'register' || (mode === 'otp' && otpStep === 'verify')) && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                {mode === 'otp' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {mode === 'otp' && otpStep === 'verify' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">6-Digit Single-Use OTP Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono tracking-widest rounded-lg bg-gray-950/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg btn-primary text-white text-sm font-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Complete Registration'}
                {mode === 'otp' && (otpStep === 'request' ? 'Generate OTP' : 'Update Password')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-400 space-y-2">
          {mode === 'login' && (
            <>
              <p>
                Don't have an account?{' '}
                <button onClick={() => { setMode('register'); setError(null); }} className="text-indigo-400 hover:underline font-semibold">
                  Register here
                </button>
              </p>
              <p>
                <button onClick={() => { setMode('otp'); setOtpStep('request'); setError(null); }} className="text-gray-400 hover:text-white">
                  Forgot Password? Reset via OTP
                </button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <p>
              Already registered?{' '}
              <button onClick={() => { setMode('login'); setError(null); }} className="text-indigo-400 hover:underline font-semibold">
                Sign In
              </button>
            </p>
          )}

          {mode === 'otp' && (
            <p>
              Back to{' '}
              <button onClick={() => { setMode('login'); setError(null); }} className="text-indigo-400 hover:underline font-semibold">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
