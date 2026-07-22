'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LessonPlayerModal from '@/components/LessonPlayerModal';
import RemarkDrawer from '@/components/RemarkDrawer';
import { fetchApi } from '@/lib/api';
import { Course, Enrollment, Remark, User } from '@/types';
import { Flame, BookOpen, Award, GraduationCap, MessageSquare, Play, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState<{
    user: User;
    streak_days: number;
    completed_lessons_count: number;
    enrollments: Enrollment[];
    remarks: Remark[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [quizAttemptMap, setQuizAttemptMap] = useState<Record<number, { total_attempts: number; passed: boolean; best_score: number }>>({});
  const [remarkDrawerOpen, setRemarkDrawerOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/dashboard/student');
      setData(res);
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
      alert(err.message || 'Failed to open course player');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white text-sm">
        <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></span>
        Loading Student Dashboard...
      </div>
    );
  }

  const user = data?.user;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar user={user} onUserChange={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Welcome Header & Streaks Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-xs font-semibold text-indigo-300">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              Cohort Year {user?.year || 1} • Roll Number: {user?.roll_number || 'PENDING'}
            </div>
            <h1 className="text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
            <p className="text-xs text-gray-300">
              Assigned Mentor: <span className="text-indigo-400 font-semibold">{user?.mentor?.staff_id || 'MTR-CSE-101'}</span> ({user?.mentor?.department?.name || 'Computer Science'})
            </p>
          </div>

          <div className="flex items-center gap-4 z-10">
            <div className="glass-card px-5 py-3 rounded-2xl border border-amber-500/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6 fill-amber-400" />
              </div>
              <div>
                <span className="text-xl font-bold text-white block leading-none">{data?.streak_days || 1} Days</span>
                <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Learning Streak</span>
              </div>
            </div>

            <button
              onClick={() => setRemarkDrawerOpen(true)}
              className="px-5 py-3.5 rounded-2xl btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <MessageSquare className="w-4 h-4" /> Mentor Q&A Drawer
            </button>
          </div>
        </div>

        {/* Enrolled Courses Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Active Course Enrollments
            </h2>
            <span className="text-xs text-gray-400">{data?.enrollments.length || 0} Courses Enrolled</span>
          </div>

          {data?.enrollments.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl text-center text-xs text-gray-400 border border-gray-800">
              You have not enrolled in any courses yet. Browse the course catalog to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.enrollments.map((enr) => {
                const c = enr.course;
                if (!c) return null;
                const pct = enr.progress_pct || 0;
                return (
                  <div key={enr.id} className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-indigo-400">{c.department?.code || 'CSE'}</span>
                        <span className="text-xs font-bold text-emerald-400">{pct}% Completed</span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-800/80">
                      {/* Progress Bar */}
                      <div className="w-full h-2.5 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>

                      <button
                        onClick={() => openPlayer(c)}
                        className="w-full py-2.5 rounded-xl btn-primary text-white text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-white" /> Continue Learning
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

      {user && (
        <RemarkDrawer
          isOpen={remarkDrawerOpen}
          user={user}
          courses={data?.enrollments.map((e) => e.course!).filter(Boolean) || []}
          remarks={data?.remarks || []}
          onClose={() => setRemarkDrawerOpen(false)}
          onRemarkUpdated={loadData}
        />
      )}
    </div>
  );
}
