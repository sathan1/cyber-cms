'use client';

import React from 'react';
import { X, User as UserIcon, Mail, ShieldCheck, GraduationCap, Award, Hash, CheckCircle2, Clock } from 'lucide-react';
import { User } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, user, onClose }: ProfileModalProps) {
  if (!isOpen || !user) return null;

  const isVerified = !!user.email_verified_at;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-indigo-500/30 shadow-2xl p-6 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Profile Details List */}
        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" /> Email Address
            </span>
            <span className="font-mono text-white font-semibold">{user.email}</span>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
            <span className="text-gray-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Email Verification
            </span>
            {isVerified ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified OTP
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending
              </span>
            )}
          </div>

          {user.role === 'STUDENT' && (
            <>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-400" /> Academic Cohort
                </span>
                <span className="text-white font-bold">Year {user.year || '1'}</span>
              </div>

              <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-400" /> Roll Number
                </span>
                <span className="font-mono text-indigo-300 font-bold">{user.roll_number || 'NOT ONBOARDED'}</span>
              </div>
            </>
          )}

          {user.mentor && (
            <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> Department / Mentor
              </span>
              <span className="text-emerald-300 font-semibold">{user.mentor.department?.name || 'Computer Science'} ({user.mentor.staff_id})</span>
            </div>
          )}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 text-xs font-semibold"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
