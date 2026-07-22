'use client';

import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle, HelpCircle, Award, ArrowRight, ArrowLeft, BookOpen,
  Lock, AlertCircle, FileText, Clock, Send, CheckCircle2, RefreshCw
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { Course, Lesson, Assignment, AssignmentSubmission } from '@/types';

interface QuizAttemptInfo {
  total_attempts: number;
  passed: boolean;
  best_score: number;
}

interface LessonPlayerModalProps {
  isOpen: boolean;
  course: Course;
  initialLessonIndex?: number;
  completedLessonIds: number[];
  quizAttemptMap?: Record<number, QuizAttemptInfo>;
  onClose: () => void;
  onLessonCompleted: (lessonId: number, updatedCompletedIds: number[]) => void;
}

export default function LessonPlayerModal({
  isOpen,
  course,
  initialLessonIndex = 0,
  completedLessonIds: initialCompletedIds,
  quizAttemptMap: initialAttemptMap = {},
  onClose,
  onLessonCompleted,
}: LessonPlayerModalProps) {
  const [activeIdx, setActiveIdx] = useState<number>(initialLessonIndex);
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'assignments'>('content');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{
    score_pct: number; passed: boolean; message: string;
    attempt_number?: number; max_retries?: number; retries_remaining?: number; retries_exhausted?: boolean;
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(initialCompletedIds);
  const [quizAttemptMap, setQuizAttemptMap] = useState<Record<number, QuizAttemptInfo>>(initialAttemptMap);

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>((course.assignments as Assignment[]) || []);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<number | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  if (!isOpen || !course.lessons || course.lessons.length === 0) return null;

  const currentLesson: Lesson = course.lessons[activeIdx] || course.lessons[0];
  const isCompleted = completedLessonIds.includes(currentLesson.id);
  const currentQuizAttemptInfo = currentLesson.quiz ? quizAttemptMap[currentLesson.quiz.id] : undefined;

  const isLessonUnlocked = (idx: number): boolean => {
    if (idx === 0) return true;
    const prevLesson = course.lessons![idx - 1];
    return completedLessonIds.includes(prevLesson.id);
  };

  const quizIsLocked = (): boolean => {
    if (!currentLesson.quiz || !currentQuizAttemptInfo) return false;
    return !currentQuizAttemptInfo.passed &&
      currentQuizAttemptInfo.total_attempts >= currentLesson.quiz.max_retries;
  };

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      const res = await fetchApi(`/lessons/${currentLesson.id}/complete`, { method: 'POST' });
      const updated = res.completed_lesson_ids || [...completedLessonIds, currentLesson.id];
      setCompletedLessonIds(updated);
      onLessonCompleted(currentLesson.id, updated);
      if (activeIdx < course.lessons!.length - 1) {
        setTimeout(() => { setActiveIdx(activeIdx + 1); setActiveTab('content'); setQuizResult(null); }, 600);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to mark lesson as complete. Make sure you passed the quiz first.');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentLesson.quiz) return;
    setSubmittingQuiz(true);
    setQuizResult(null);
    try {
      const res = await fetchApi(`/quizzes/${currentLesson.quiz.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: quizAnswers }),
      });
      setQuizResult(res);

      // Update local attempt map
      const quizId = currentLesson.quiz.id;
      setQuizAttemptMap(prev => ({
        ...prev,
        [quizId]: {
          total_attempts: res.attempt_number,
          passed: res.passed || prev[quizId]?.passed || false,
          best_score: Math.max(res.score_pct, prev[quizId]?.best_score || 0),
        }
      }));

      if (res.passed) {
        const updated = res.completed_lesson_ids || [...completedLessonIds, currentLesson.id];
        setCompletedLessonIds(updated);
        onLessonCompleted(currentLesson.id, updated);
        if (activeIdx < course.lessons!.length - 1) {
          setTimeout(() => { setActiveIdx(activeIdx + 1); setActiveTab('content'); setQuizResult(null); }, 1500);
        }
      }
    } catch (err: any) {
      if (err.message?.includes('Maximum retry')) {
        setQuizResult({ score_pct: 0, passed: false, message: err.message, retries_exhausted: true });
      } else {
        alert(err.message || 'Quiz submission failed.');
      }
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: number) => {
    if (!submissionContent.trim()) return;
    setSubmittingAssignment(true);
    try {
      await fetchApi(`/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ content: submissionContent }),
      });
      setSubmittingAssignmentId(null);
      setSubmissionContent('');
      // Refresh assignments to show submission status
      const res = await fetchApi('/assignments');
      const courseAssignments = (res.assignments || []).filter((a: Assignment) => a.course_id === course.id);
      setAssignments(courseAssignments);
    } catch (err: any) {
      alert(err.message || 'Failed to submit assignment.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const tabsList = [
    { id: 'content' as const, label: 'Module Content', icon: BookOpen },
    ...(currentLesson.has_quiz ? [{ id: 'quiz' as const, label: 'Knowledge Check', icon: HelpCircle }] : []),
    ...(assignments.length > 0 ? [{ id: 'assignments' as const, label: `Assignments (${assignments.length})`, icon: FileText }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-5xl h-[88vh] rounded-2xl border border-gray-700/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/60 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white leading-none truncate">{course.title}</h3>
              <span className="text-xs text-gray-400">
                Module {activeIdx + 1}/{course.lessons.length}: {currentLesson.title}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 overflow-hidden">
          {/* Sidebar */}
          <div className="border-r border-gray-800/80 bg-gray-950/50 p-4 space-y-2 overflow-y-auto">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Course Modules</h4>
            {course.lessons.map((les, idx) => {
              const done = completedLessonIds.includes(les.id);
              const unlocked = isLessonUnlocked(idx);
              const isActive = idx === activeIdx;
              const attemptInfo = les.quiz ? quizAttemptMap[les.quiz.id] : undefined;
              const quizLocked = attemptInfo && !attemptInfo.passed && les.quiz && attemptInfo.total_attempts >= les.quiz.max_retries;

              return (
                <button
                  key={les.id}
                  disabled={!unlocked}
                  onClick={() => { if (unlocked) { setActiveIdx(idx); setActiveTab('content'); setQuizResult(null); setQuizAnswers({}); } }}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    isActive ? 'bg-indigo-600/25 border-indigo-500 text-white font-semibold shadow-md'
                    : done ? 'glass-card border-emerald-500/30 text-emerald-200 hover:text-white'
                    : unlocked ? 'glass-card border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
                    : 'opacity-40 border-gray-800/50 cursor-not-allowed text-gray-500 bg-gray-950/30'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="block truncate">{idx + 1}. {les.title}</span>
                    {les.has_quiz && (
                      <span className={`text-[10px] font-medium ${quizLocked ? 'text-rose-400' : 'text-amber-400'}`}>
                        {quizLocked ? '🔒 Quiz Locked' : '✎ Includes Quiz'}
                        {attemptInfo && !attemptInfo.passed && !quizLocked && les.quiz &&
                          ` (${les.quiz.max_retries - attemptInfo.total_attempts} left)`}
                      </span>
                    )}
                  </div>
                  {done ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  : unlocked ? <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                  : <Lock className="w-4 h-4 text-gray-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Main Panel */}
          <div className="md:col-span-3 flex flex-col h-full bg-gray-900/30 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-800 bg-gray-950/40 px-4 pt-3 gap-4 text-xs font-semibold flex-shrink-0 flex-wrap">
              {tabsList.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeTab === t.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-white'
                  }`}>
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {/* ── Content Tab ─────────────────────────────────────────── */}
              {activeTab === 'content' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-4">{currentLesson.title}</h2>
                  <div className="glass-card p-5 rounded-2xl border border-gray-800 text-gray-200 whitespace-pre-line leading-relaxed text-sm">
                    {currentLesson.content}
                  </div>
                  {currentLesson.has_quiz && currentLesson.quiz && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
                      <HelpCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="font-semibold">Knowledge Check Required</p>
                        <p className="text-amber-400/70">You must pass the quiz ({currentLesson.quiz.pass_score}% pass score, {currentLesson.quiz.max_retries} max attempts) to unlock the next module.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Quiz Tab ─────────────────────────────────────────────── */}
              {activeTab === 'quiz' && currentLesson.quiz && (
                <div className="space-y-5">
                  {/* Quiz header with attempt info */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentLesson.quiz.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Pass Score: {currentLesson.quiz.pass_score}% · Max Retries: {currentLesson.quiz.max_retries}</p>
                    </div>
                    {currentQuizAttemptInfo && (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-800 border border-gray-700 text-gray-300">
                          Attempt {currentQuizAttemptInfo.total_attempts}/{currentLesson.quiz.max_retries}
                        </span>
                        {currentQuizAttemptInfo.passed && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Passed
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quiz result banner */}
                  {quizResult && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
                      quizResult.passed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : quizResult.retries_exhausted ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}>
                      <Award className="w-6 h-6 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">{quizResult.passed ? `✓ PASSED — ${quizResult.score_pct}%` : `✗ Score: ${quizResult.score_pct}%`}</p>
                        <p className="text-xs mt-0.5 opacity-80">{quizResult.message}</p>
                        {quizResult.retries_exhausted && (
                          <p className="text-xs mt-1 text-rose-400">Contact your mentor to request a retry reset.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quiz locked state */}
                  {quizIsLocked() && !quizResult?.passed ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8 text-rose-400" />
                      </div>
                      <p className="text-sm font-semibold text-rose-300">Quiz Locked — Maximum Retries Reached</p>
                      <p className="text-xs text-gray-400">You have used all {currentLesson.quiz.max_retries} attempts. Contact your mentor for a retry reset.</p>
                    </div>
                  ) : !currentQuizAttemptInfo?.passed && (
                    <div className="space-y-5">
                      {currentLesson.quiz.questions_json?.map((q, qIdx) => (
                        <div key={qIdx} className="glass-card p-4 rounded-xl border border-gray-800 space-y-3">
                          <p className="text-sm font-semibold text-white">Q{qIdx + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => (
                              <button key={optIdx} onClick={() => setQuizAnswers(p => ({ ...p, [qIdx]: optIdx }))}
                                className={`w-full text-left p-3 rounded-lg border text-xs flex items-center gap-3 transition-colors ${
                                  quizAnswers[qIdx] === optIdx
                                    ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                                    : 'bg-gray-950/40 border-gray-800 text-gray-300 hover:bg-gray-800/50'
                                }`}>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 ${
                                  quizAnswers[qIdx] === optIdx ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </div>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button onClick={handleSubmitQuiz} disabled={submittingQuiz || Object.keys(quizAnswers).length === 0}
                        className="px-6 py-2.5 rounded-xl btn-primary text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-40">
                        {submittingQuiz ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HelpCircle className="w-4 h-4" />}
                        Submit Knowledge Check
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Assignments Tab ───────────────────────────────────────── */}
              {activeTab === 'assignments' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Course Assignments</h3>
                  {assignments.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No assignments for this course yet.</p>
                  ) : (
                    assignments.map((assignment) => {
                      const mySubmission = assignment.my_submission;
                      const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
                      return (
                        <div key={assignment.id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{assignment.title}</h4>
                              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{assignment.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 flex-wrap">
                                {assignment.due_date && (
                                  <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-400' : 'text-gray-400'}`}>
                                    <Clock className="w-3 h-3" /> Due: {new Date(assignment.due_date).toLocaleDateString()}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Max Score: {assignment.max_score}
                                </span>
                              </div>
                            </div>
                            {mySubmission ? (
                              <div className="text-right flex-shrink-0">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                                  mySubmission.status === 'graded' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                }`}>
                                  {mySubmission.status === 'graded' ? `Graded: ${mySubmission.score}/${assignment.max_score}` : 'Submitted'}
                                </span>
                                {mySubmission.feedback && <p className="text-[10px] text-gray-400 mt-1 max-w-xs text-right">"{mySubmission.feedback}"</p>}
                              </div>
                            ) : (
                              !isOverdue && (
                                <button
                                  onClick={() => setSubmittingAssignmentId(assignment.id)}
                                  className="px-3 py-1.5 rounded-lg btn-primary text-white text-[11px] font-semibold flex items-center gap-1 flex-shrink-0"
                                >
                                  <Send className="w-3 h-3" /> Submit
                                </button>
                              )
                            )}
                          </div>

                          {/* Submission form (inline) */}
                          {submittingAssignmentId === assignment.id && !mySubmission && (
                            <div className="space-y-3 border-t border-gray-800 pt-3">
                              <label className="block text-xs text-gray-400">Your Submission</label>
                              <textarea rows={5} value={submissionContent} onChange={e => setSubmissionContent(e.target.value)}
                                placeholder="Paste your code, GitHub link, or write your answer here..."
                                className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-y" />
                              <div className="flex gap-2">
                                <button onClick={() => { setSubmittingAssignmentId(null); setSubmissionContent(''); }}
                                  className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 text-xs hover:bg-gray-800">
                                  Cancel
                                </button>
                                <button onClick={() => handleSubmitAssignment(assignment.id)} disabled={submittingAssignment || !submissionContent.trim()}
                                  className="px-4 py-1.5 rounded-lg btn-primary text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40">
                                  {submittingAssignment ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                  Submit Assignment
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="p-4 border-t border-gray-800 bg-gray-950/60 flex items-center justify-between flex-shrink-0 gap-2">
              <button disabled={activeIdx === 0}
                onClick={() => { setActiveIdx(p => Math.max(0, p - 1)); setActiveTab('content'); setQuizResult(null); setQuizAnswers({}); }}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 disabled:opacity-40">
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <button onClick={handleMarkComplete} disabled={markingComplete || isCompleted}
                className={`px-5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isCompleted ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 cursor-default'
                  : 'btn-primary text-white shadow-lg'
                }`}>
                {markingComplete
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <CheckCircle className="w-4 h-4" />
                }
                {isCompleted ? 'Completed ✓' : 'Mark Complete & Unlock Next'}
              </button>

              <button
                disabled={activeIdx === course.lessons.length - 1 || !isLessonUnlocked(activeIdx + 1)}
                onClick={() => { if (isLessonUnlocked(activeIdx + 1)) { setActiveIdx(p => p + 1); setActiveTab('content'); setQuizResult(null); setQuizAnswers({}); } }}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center gap-1.5 disabled:opacity-40">
                Next {!isLessonUnlocked(activeIdx + 1) && <Lock className="w-3 h-3 text-gray-500" />} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
