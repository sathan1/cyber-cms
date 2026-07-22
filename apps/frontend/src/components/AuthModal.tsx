'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Shield, KeyRound, ArrowRight, CheckCircle, AlertCircle, Award } from 'lucide-react';
import { fetchApi, setAuthToken } from '@/lib/api';
import { User, Role } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'otp';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'verify_reg_otp' | 'forgot'>(initialMode);
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
  const [mentorCode, setMentorCode] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Reset modal state on open or initialMode change
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setOtpStep('request');
      setLoading(false);
      setError(null);
      setSuccessMsg(null);
      setDebugOtp(null);
      setOtpCode('');
    }
  }, [isOpen, initialMode]);

  const sendHtmlEmail = (recipientEmail: string, subjectTitle: string, code: string, isRegister: boolean) => {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; text-align: center;">
          <div style="background-color: #4f46e5; color: white; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
            CyberCMS Academic Platform
          </div>
          <h2 style="color: #1e293b; margin-bottom: 10px;">${subjectTitle}</h2>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Please use the following 6-digit verification code to complete your request:</p>
          <div style="background-color: #e0e7ff; color: #3730a3; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
            ${code}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 15px;">This code is valid for ${isRegister ? '15' : '10'} minutes. If you did not request this, please ignore this email.</p>
        </div>
      `;
      fetch('https://script.google.com/macros/s/AKfycbyDg7v5tmiGKrtCFk7z5WswwQNEtr8F1Vc_8G2oKoQ3qHfMc4Lsz7uaeCtrUi011omH/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subjectTitle,
          body: html,
        }),
      }).catch(() => {});
    } catch {}
  };

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
        if (res.require_otp) {
          setSuccessMsg(res.message);
          setMode('verify_reg_otp');
        } else {
          setAuthToken(res.token);
          onSuccess(res.user);
          onClose();
        }
      } else if (mode === 'register') {
        const res = await fetchApi('/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role, mentor_code: mentorCode }),
        });
        if (res.require_otp) {
          setSuccessMsg(res.message);
          if (res.otp) {
            setDebugOtp(res.otp);
            sendHtmlEmail(email, 'CyberCMS Email Verification OTP', res.otp, true);
          }
          setMode('verify_reg_otp');
        } else {
          setAuthToken(res.token);
          onSuccess(res.user);
          onClose();
        }
      } else if (mode === 'verify_reg_otp') {
        const res = await fetchApi('/verify-otp', {
          method: 'POST',
          body: JSON.stringify({ email, otp: otpCode }),
        });
        setAuthToken(res.token);
        onSuccess(res.user);
        onClose();
      } else if (mode === 'forgot') {
        if (otpStep === 'request') {
          const res = await fetchApi('/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
          });
          if (res.otp) {
            setDebugOtp(res.otp);
            sendHtmlEmail(email, 'CyberCMS Password Reset OTP', res.otp, false);
          }
          setSuccessMsg('OTP code sent to email. Valid for 10 minutes.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-gray-700/80 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
            {mode === 'otp' || mode === 'verify_reg_otp' ? <KeyRound className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'login' && 'Sign In to CyberCMS'}
            {mode === 'register' && 'Create Academic Account'}
            {mode === 'verify_reg_otp' && 'Verify Email OTP Code'}
            {mode === 'otp' && (otpStep === 'request' ? 'Password Reset OTP' : 'Verify OTP & Reset Password')}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login' && 'Enter your credentials to access your portal'}
            {mode === 'register' && 'Create your account to start learning'}
            {mode === 'verify_reg_otp' && `Enter the 6-digit OTP code sent to ${email}`}
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
            <p>{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
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

          {(mode === 'login' || mode === 'register' || (mode === 'otp' && otpStep === 'request')) && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Account Type *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="STUDENT">Academic Student</option>
                  <option value="STAFF">Department Staff / Mentor</option>
                  <option value="PAID_USER">Paid Course Member</option>
                </select>
              </div>

              {role === 'STAFF' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Staff Mentor ID / Code (Optional)</label>
                  <div className="relative">
                    <Award className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={mentorCode}
                      onChange={(e) => setMentorCode(e.target.value)}
                      placeholder="e.g. ST-1001 or MTR-CSE-101"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </>
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

          {(mode === 'verify_reg_otp' || (mode === 'otp' && otpStep === 'verify')) && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">6-Digit Verification OTP Code *</label>
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
                {mode === 'register' && 'Register & Send OTP'}
                {mode === 'verify_reg_otp' && 'Verify OTP & Enter Portal'}
                {mode === 'otp' && (otpStep === 'request' ? 'Generate Reset OTP' : 'Update Password')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-400 space-y-2">
          {mode === 'login' && (
            <>
              <p>
                Don&apos;t have an account?{' '}
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

          {(mode === 'register' || mode === 'verify_reg_otp' || mode === 'otp') && (
            <p>
              Already verified?{' '}
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
