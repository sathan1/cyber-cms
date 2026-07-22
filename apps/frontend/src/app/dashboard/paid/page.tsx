'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LessonPlayerModal from '@/components/LessonPlayerModal';
import { fetchApi } from '@/lib/api';
import { Course, Enrollment, User } from '@/types';
import { ShieldCheck, Play, Award, CheckCircle2, Lock, Clock, Sparkles } from 'lucide-react';

export default function PaidUserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [quizAttemptMap, setQuizAttemptMap] = useState<Record<number, { total_attempts: number; passed: boolean; best_score: number }>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const userRes = await fetchApi('/me');
      setUser(userRes.user);

      const studentRes = await fetchApi('/dashboard/student');
      setEnrollments(studentRes.enrollments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openPlayer = async (course: Course) => {
    try {
      const detailRes = await fetchApi(`/courses/${course.slug}`);
      setActiveCourse(detailRes.course);
      setCompletedLessonIds(detailRes.completed_lesson_ids || []);
      setQuizAttemptMap(detailRes.quiz_attempt_map || {});
    } catch (err: any) {
      alert(err.message || 'Failed to launch course player');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white text-sm">
        <span className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        Loading Paid Member Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={user} onUserChange={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Plan Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
              Paid Pro Membership
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">Welcome, {user?.name}!</h1>
            <p className="text-xs text-gray-400 mt-1">Unlimited access unlocked via Razorpay Payment Signature Validation.</p>
          </div>

          <div className="glass-card px-4 py-2.5 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div className="text-xs">
              <span className="text-white font-bold block">Access Expiry Status</span>
              <span className="text-emerald-300 font-semibold">Lifetime Access Active</span>
            </div>
          </div>
        </div>

        {/* Unlocked Courses Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Your Unlocked Courses</h2>

          {enrollments.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center text-xs text-gray-400 border border-gray-800">
              No active course purchases found. Visit the home catalog to purchase a course.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enr) => {
                const c = enr.course;
                if (!c) return null;
                const pct = enr.progress_pct || 0;
                return (
                  <div key={enr.id} className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Razorpay Signature Verified
                        </span>
                        <span className="text-xs font-bold text-white">{pct}% Completed</span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-800/80">
                      <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>

                      <button
                        onClick={() => openPlayer(c)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" /> Launch Lecture Viewer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {activeCourse && (
        <LessonPlayerModal
          isOpen={!!activeCourse}
          course={activeCourse}
          completedLessonIds={completedLessonIds}
          quizAttemptMap={quizAttemptMap}
          onClose={() => setActiveCourse(null)}
          onLessonCompleted={(_lessonId, updatedIds) => {
            setCompletedLessonIds(updatedIds);
            loadData();
          }}
        />
      )}
    </div>
  );
}
