'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import OnboardingModal from '@/components/OnboardingModal';
import ManualCheckoutModal from '@/components/ManualCheckoutModal';
import LessonPlayerModal from '@/components/LessonPlayerModal';
import RemarkDrawer from '@/components/RemarkDrawer';
import { Course, User, Remark } from '@/types';
import { fetchApi, getAuthToken } from '@/lib/api';
import { Shield, BookOpen, Sparkles, CheckCircle2, Play, Lock, MessageSquare, Award, ArrowRight } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp'>('login');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);
  const [activeCourseForPlayer, setActiveCourseForPlayer] = useState<Course | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [quizAttemptMap, setQuizAttemptMap] = useState<Record<number, { total_attempts: number; passed: boolean; best_score: number }>>({});
  const [remarkDrawerOpen, setRemarkDrawerOpen] = useState(false);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (getAuthToken()) {
        const userRes = await fetchApi('/me').catch(() => null);
        if (userRes?.user) setUser(userRes.user);
      }

      const coursesRes = await fetchApi('/courses');
      setCourses(coursesRes.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const openAuth = (mode: 'login' | 'register' | 'otp') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleCourseClick = async (course: Course) => {
    if (!user) {
      openAuth('login');
      return;
    }

    try {
      const detailRes = await fetchApi(`/courses/${course.slug}`);
      if (detailRes.is_enrolled) {
        setActiveCourseForPlayer(detailRes.course);
        setCompletedLessonIds(detailRes.completed_lesson_ids || []);
        setQuizAttemptMap(detailRes.quiz_attempt_map || {});
      } else if (user.role === 'STUDENT') {
        handleEnrollFree(course);
      } else {
        setSelectedCourseForPayment(course);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to fetch course details');
    }
  };

  const handleEnrollFree = async (course: Course) => {
    if (!user) {
      openAuth('login');
      return;
    }

    try {
      await fetchApi(`/courses/${course.slug}/enroll`, { method: 'POST' });
      const detailRes = await fetchApi(`/courses/${course.slug}`);
      setActiveCourseForPlayer(detailRes.course);
      setCompletedLessonIds(detailRes.completed_lesson_ids || []);
      setQuizAttemptMap(detailRes.quiz_attempt_map || {});
      loadInitialData();
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    }
  };

  const loadRemarks = async () => {
    if (!user) return;
    try {
      const res = await fetchApi('/remarks');
      setRemarks(res.remarks || []);
    } catch (err) {}
  };

  const openRemarks = () => {
    loadRemarks();
    setRemarkDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar
        user={user}
        onUserChange={setUser}
        onOpenAuth={openAuth}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-gray-800/60">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full gradient-badge text-xs font-semibold text-indigo-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Sequential Module Unlocks & Razorpay Integration
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Secure E-Learning CMS & <span className="gradient-text">Academic Mentorship</span> Platform
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Modular full-stack portal with role-based dashboards, cohort risk watchlists, 10-minute single-use OTP reset, and Razorpay signature verified payments.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <a
                href={
                  user.role === 'STUDENT'
                    ? '/dashboard/student'
                    : user.role === 'PAID_USER'
                    ? '/dashboard/paid'
                    : user.role === 'ADMIN'
                    ? '/dashboard/admin'
                    : '/dashboard/mentor'
                }
                className="px-6 py-3 rounded-xl btn-primary text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                Go to Portal Dashboard <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={() => openAuth('register')}
                className="px-6 py-3 rounded-xl btn-primary text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                Get Started Now <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {user && (
              <button
                onClick={openRemarks}
                className="px-6 py-3 rounded-xl glass-card text-indigo-300 border border-indigo-500/30 text-sm font-semibold flex items-center gap-2 hover:bg-indigo-950/40"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" /> Open Mentor Q&A Drawer
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Course Catalog */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Academic & Paid Courses</h2>
            <p className="text-xs text-gray-400 mt-1">Explore verified courses with sequential module progression and quiz checks</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-300 border border-indigo-500/30">
            {courses.length} Available Courses
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 glass-card rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-gray-800">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                      {course.department?.code || 'CSE'}
                    </span>
                    <span className="text-sm font-bold text-emerald-400">
                      {course.price === 0 ? 'FREE' : `₹${course.price}`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed">{course.description}</p>
                </div>

                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{course.lessons?.length || 3} Sequential Modules</span>
                  </div>

                  <button
                    onClick={() => handleCourseClick(course)}
                    className="px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    {course.is_enrolled ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" /> Continue
                      </>
                    ) : user?.role === 'STUDENT' ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Enroll Free
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Unlock Course
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          loadInitialData();
          if (u.role === 'STUDENT' && !u.roll_number) setOnboardingOpen(true);
        }}
      />

      {user && (
        <OnboardingModal
          isOpen={onboardingOpen}
          user={user}
          onClose={() => setOnboardingOpen(false)}
          onSuccess={(u) => {
            setUser(u);
            loadInitialData();
          }}
        />
      )}

      {selectedCourseForPayment && (
        <ManualCheckoutModal
          isOpen={!!selectedCourseForPayment}
          course={selectedCourseForPayment}
          user={user}
          onClose={() => setSelectedCourseForPayment(null)}
          onSuccess={() => {
            setSelectedCourseForPayment(null);
            loadInitialData();
          }}
        />
      )}

      {activeCourseForPlayer && (
        <LessonPlayerModal
          isOpen={!!activeCourseForPlayer}
          course={activeCourseForPlayer}
          completedLessonIds={completedLessonIds}
          quizAttemptMap={quizAttemptMap}
          onClose={() => setActiveCourseForPlayer(null)}
          onLessonCompleted={(_, updatedIds) => {
            setCompletedLessonIds(updatedIds);
            loadInitialData();
          }}
        />
      )}

      {user && (
        <RemarkDrawer
          isOpen={remarkDrawerOpen}
          user={user}
          courses={courses}
          remarks={remarks}
          onClose={() => setRemarkDrawerOpen(false)}
          onRemarkUpdated={loadRemarks}
        />
      )}
    </div>
  );
}
