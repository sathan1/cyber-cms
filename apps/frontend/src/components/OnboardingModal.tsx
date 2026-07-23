'use client';

import React, { useState, useEffect } from 'react';
import { X, GraduationCap, CheckCircle, AlertCircle, Sparkles, Building } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { MentorId, User } from '@/types';

interface OnboardingModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
}

const DEPARTMENTS = [
  { code: 'CSE', name: 'CSE - Computer Science & Engineering' },
  { code: 'IT', name: 'IT - Information Technology' },
  { code: 'AIML', name: 'AIML - Artificial Intelligence & Machine Learning' },
  { code: 'AIDS', name: 'AIDS - Artificial Intelligence & Data Science' },
  { code: 'CYBER', name: 'CYBER - Cyber Security' },
  { code: 'MECH', name: 'MECH - Mechanical Engineering' },
  { code: 'EEE', name: 'EEE - Electrical & Electronics Engineering' },
  { code: 'ECE', name: 'ECE - Electronics & Communication Engineering' },
  { code: 'VLSI', name: 'VLSI - VLSI Design & Technology' },
  { code: 'CIVIL', name: 'CIVIL - Civil Engineering' },
];

export default function OnboardingModal({ isOpen, user, onClose, onSuccess }: OnboardingModalProps) {
  const [departmentCode, setDepartmentCode] = useState('CSE');
  const [year, setYear] = useState<number>(3);
  const [rollNumber, setRollNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi('/onboard', {
        method: 'POST',
        body: JSON.stringify({
          department_code: departmentCode,
          year,
          roll_number: rollNumber,
        }),
      });

      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Student onboarding failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Student First-Login Onboarding</h3>
          <p className="text-xs text-gray-400 mt-1">
            Select your academic department, year cohort, and official student roll number to unlock your portal.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="glass-card p-3 rounded-xl border border-indigo-500/20 mb-5 flex items-center gap-3">
          <Building className="w-5 h-5 text-indigo-400 shrink-0" />
          <div className="text-xs">
            <span className="text-gray-300 font-semibold block">College Domain Status</span>
            <span className="text-gray-400">Account email: <span className="text-indigo-300 font-mono">{user.email}</span></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Select Academic Department *</label>
            <select
              required
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Student Roll Number</label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. CSE2026-042"
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-950/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg btn-primary text-white text-sm font-semibold flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Activate Student Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
