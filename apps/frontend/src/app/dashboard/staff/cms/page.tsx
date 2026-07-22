'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchApi } from '@/lib/api';
import {
  Course, Lesson, Quiz, QuizQuestion, Assignment, AssignmentSubmission, QuizAttemptRecord, Department
} from '@/types';
import {
  BookOpen, Plus, Pencil, Trash2, ChevronRight, ChevronDown, Save, X,
  HelpCircle, FileText, BarChart2, CheckCircle2, AlertCircle, Eye,
  ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Award, Clock, Users, RefreshCw
} from 'lucide-react';

type CmsTab = 'courses' | 'modules' | 'assignments' | 'quiz-monitor';

// ── Empty State Component ────────────────────────────────────────────────────
function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
      <Icon className="w-10 h-10 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ── Quiz Question Builder ────────────────────────────────────────────────────
function QuizQuestionBuilder({
  questions, onChange
}: { questions: QuizQuestion[]; onChange: (qs: QuizQuestion[]) => void }) {
  const addQuestion = () => onChange([...questions, { question: '', options: ['', '', '', ''], correct: 0 }]);
  const removeQuestion = (idx: number) => onChange(questions.filter((_, i) => i !== idx));
  const updateQuestion = (idx: number, field: 'question' | 'correct', value: string | number) => {
    const updated = [...questions];
    (updated[idx] as any)[field] = value;
    onChange(updated);
  };
  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="glass-card p-4 rounded-xl border border-gray-700 space-y-3 relative">
          <button onClick={() => removeQuestion(qIdx)} className="absolute top-3 right-3 text-rose-400 hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">Question {qIdx + 1}</label>
            <input
              value={q.question}
              onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
              placeholder="Enter your question..."
              className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <button
                  onClick={() => updateQuestion(qIdx, 'correct', oIdx)}
                  className={`w-5 h-5 rounded-full border flex-shrink-0 transition-all ${q.correct === oIdx ? 'bg-emerald-500 border-emerald-400' : 'border-gray-600'}`}
                  title={q.correct === oIdx ? 'Correct answer' : 'Set as correct'}
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                  className="flex-1 px-2 py-1.5 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500">● = correct answer</p>
        </div>
      ))}
      <button
        onClick={addQuestion}
        className="w-full py-2 border border-dashed border-gray-700 rounded-xl text-xs text-indigo-400 hover:text-indigo-300 hover:border-indigo-500 flex items-center justify-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Question
      </button>
    </div>
  );
}

// ── Main CMS Page ─────────────────────────────────────────────────────────────
export default function StaffCmsPage() {
  const [activeTab, setActiveTab] = useState<CmsTab>('courses');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Courses Tab
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ department_id: '', title: '', description: '', price: '', status: 'draft' });

  // Modules Tab
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', position: 1, has_quiz: false });

  // Quiz Builder
  const [quizEditingLessonId, setQuizEditingLessonId] = useState<number | null>(null);
  const [quizForm, setQuizForm] = useState({ title: '', pass_score: 70, max_retries: 3, questions: [] as QuizQuestion[] });
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Assignments Tab
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', due_date: '', max_score: 100, status: 'draft' });
  const [viewingSubmissionsForId, setViewingSubmissionsForId] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: 0, feedback: '' });

  // Quiz Attempt Monitor
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptRecord[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const res = await fetchApi('/cms/courses');
      setCourses(res.courses || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoadingCourses(false); }
  }, []);

  const loadDepts = useCallback(async () => {
    try {
      const res = await fetchApi('/mentors');
      // Mentors endpoint gives mentor list; get departments separately from courses
    } catch {}
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const loadLessons = async (course: Course) => {
    setSelectedCourse(course);
    setActiveTab('modules');
    setLoadingLessons(true);
    try {
      const res = await fetchApi(`/cms/courses/${course.id}/lessons`);
      setLessons(res.lessons || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoadingLessons(false); }
  };

  const loadAssignments = async (course: Course) => {
    setSelectedCourse(course);
    setActiveTab('assignments');
    try {
      const res = await fetchApi(`/cms/courses/${course.id}/assignments`);
      setAssignments(res.assignments || []);
    } catch (e: any) { setError(e.message); }
  };

  const loadQuizAttempts = async (course: Course) => {
    setSelectedCourse(course);
    setActiveTab('quiz-monitor');
    setLoadingAttempts(true);
    try {
      const res = await fetchApi(`/cms/courses/${course.id}/quiz-attempts`);
      setQuizAttempts(res.attempts || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoadingAttempts(false); }
  };

  // ── Course CRUD ────────────────────────────────────────────────────────────
  const openCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({ department_id: '', title: '', description: '', price: '', status: 'draft' });
    setShowCourseForm(true);
  };

  const openEditCourse = (c: Course) => {
    setEditingCourse(c);
    setCourseForm({
      department_id: String(c.department_id),
      title: c.title,
      description: c.description,
      price: String(c.price),
      status: c.status,
    });
    setShowCourseForm(true);
  };

  const saveCourse = async () => {
    setSaving(true);
    setError(null);
    try {
      if (editingCourse) {
        await fetchApi(`/cms/courses/${editingCourse.id}`, { method: 'PUT', body: JSON.stringify(courseForm) });
      } else {
        await fetchApi('/cms/courses', { method: 'POST', body: JSON.stringify(courseForm) });
      }
      setShowCourseForm(false);
      loadCourses();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const deleteCourse = async (id: number) => {
    if (!confirm('Delete this course and all its content?')) return;
    await fetchApi(`/cms/courses/${id}`, { method: 'DELETE' });
    loadCourses();
  };

  // ── Lesson CRUD ────────────────────────────────────────────────────────────
  const openCreateLesson = () => {
    setEditingLesson(null);
    setLessonForm({ title: '', content: '', position: (lessons.length || 0) + 1, has_quiz: false });
    setShowLessonForm(true);
  };

  const openEditLesson = (l: Lesson) => {
    setEditingLesson(l);
    setLessonForm({ title: l.title, content: l.content, position: l.position, has_quiz: l.has_quiz });
    setShowLessonForm(true);
  };

  const saveLesson = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    setError(null);
    try {
      if (editingLesson) {
        await fetchApi(`/cms/lessons/${editingLesson.id}`, { method: 'PUT', body: JSON.stringify(lessonForm) });
      } else {
        await fetchApi(`/cms/courses/${selectedCourse.id}/lessons`, { method: 'POST', body: JSON.stringify(lessonForm) });
      }
      setShowLessonForm(false);
      const res = await fetchApi(`/cms/courses/${selectedCourse.id}/lessons`);
      setLessons(res.lessons || []);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const deleteLesson = async (id: number) => {
    if (!selectedCourse || !confirm('Delete this lesson?')) return;
    await fetchApi(`/cms/lessons/${id}`, { method: 'DELETE' });
    const res = await fetchApi(`/cms/courses/${selectedCourse.id}/lessons`);
    setLessons(res.lessons || []);
  };

  // ── Quiz CRUD ──────────────────────────────────────────────────────────────
  const openQuizEditor = (lesson: Lesson) => {
    setQuizEditingLessonId(lesson.id);
    if (lesson.quiz) {
      setQuizForm({
        title: lesson.quiz.title,
        pass_score: lesson.quiz.pass_score,
        max_retries: lesson.quiz.max_retries ?? 3,
        questions: lesson.quiz.questions_json || [],
      });
    } else {
      setQuizForm({ title: `${lesson.title} — Knowledge Check`, pass_score: 70, max_retries: 3, questions: [] });
    }
  };

  const saveQuiz = async () => {
    if (!quizEditingLessonId) return;
    setSavingQuiz(true);
    setError(null);
    try {
      await fetchApi(`/cms/lessons/${quizEditingLessonId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ ...quizForm, questions_json: quizForm.questions }),
      });
      setQuizEditingLessonId(null);
      if (selectedCourse) {
        const res = await fetchApi(`/cms/courses/${selectedCourse.id}/lessons`);
        setLessons(res.lessons || []);
      }
    } catch (e: any) { setError(e.message); }
    finally { setSavingQuiz(false); }
  };

  const deleteQuiz = async (lessonId: number) => {
    if (!confirm('Remove quiz from this lesson?')) return;
    await fetchApi(`/cms/lessons/${lessonId}/quiz`, { method: 'DELETE' });
    if (selectedCourse) {
      const res = await fetchApi(`/cms/courses/${selectedCourse.id}/lessons`);
      setLessons(res.lessons || []);
    }
  };

  // ── Assignment CRUD ────────────────────────────────────────────────────────
  const openCreateAssignment = () => {
    setEditingAssignment(null);
    setAssignmentForm({ title: '', description: '', due_date: '', max_score: 100, status: 'draft' });
    setShowAssignmentForm(true);
  };

  const openEditAssignment = (a: Assignment) => {
    setEditingAssignment(a);
    setAssignmentForm({
      title: a.title,
      description: a.description,
      due_date: a.due_date ? a.due_date.split('T')[0] : '',
      max_score: a.max_score,
      status: a.status,
    });
    setShowAssignmentForm(true);
  };

  const saveAssignment = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    setError(null);
    try {
      if (editingAssignment) {
        await fetchApi(`/cms/assignments/${editingAssignment.id}`, { method: 'PUT', body: JSON.stringify(assignmentForm) });
      } else {
        await fetchApi(`/cms/courses/${selectedCourse.id}/assignments`, { method: 'POST', body: JSON.stringify(assignmentForm) });
      }
      setShowAssignmentForm(false);
      const res = await fetchApi(`/cms/courses/${selectedCourse.id}/assignments`);
      setAssignments(res.assignments || []);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const deleteAssignment = async (id: number) => {
    if (!confirm('Delete this assignment?')) return;
    await fetchApi(`/cms/assignments/${id}`, { method: 'DELETE' });
    if (selectedCourse) {
      const res = await fetchApi(`/cms/courses/${selectedCourse.id}/assignments`);
      setAssignments(res.assignments || []);
    }
  };

  const viewSubmissions = async (assignmentId: number) => {
    setViewingSubmissionsForId(assignmentId);
    const res = await fetchApi(`/cms/assignments/${assignmentId}/submissions`);
    setSubmissions(res.submissions || []);
  };

  const gradeSubmit = async () => {
    if (!gradingSubmission) return;
    await fetchApi(`/cms/submissions/${gradingSubmission.id}/grade`, { method: 'PUT', body: JSON.stringify(gradeForm) });
    setGradingSubmission(null);
    viewSubmissions(viewingSubmissionsForId!);
  };

  // ── Status Badge ───────────────────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      draft: 'bg-gray-700/40 text-gray-400 border-gray-600/40',
      archived: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${map[status] || map.draft}`}>
        {status}
      </span>
    );
  };

  // ── Tab Content ────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'courses' as CmsTab, label: 'My Courses', icon: BookOpen },
    { id: 'modules' as CmsTab, label: selectedCourse ? `Modules — ${selectedCourse.title.slice(0, 25)}…` : 'Modules', icon: FileText },
    { id: 'assignments' as CmsTab, label: 'Assignments', icon: HelpCircle },
    { id: 'quiz-monitor' as CmsTab, label: 'Quiz Attempts', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      <Navbar onUserChange={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Page Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-semibold">
              CMS — Content Management System
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">Staff Content Portal</h1>
            <p className="text-xs text-gray-400 mt-1">
              Create courses, author lesson modules, attach quizzes with retry limits, manage assignments, and monitor student quiz attempts.
            </p>
          </div>
          {activeTab === 'courses' && (
            <button onClick={openCreateCourse} className="px-5 py-3 rounded-2xl btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> New Course
            </button>
          )}
          {activeTab === 'modules' && selectedCourse && (
            <button onClick={openCreateLesson} className="px-5 py-3 rounded-2xl btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> Add Module
            </button>
          )}
          {activeTab === 'assignments' && selectedCourse && (
            <button onClick={openCreateAssignment} className="px-5 py-3 rounded-2xl btn-primary text-white text-xs font-bold flex items-center gap-2 shadow-lg">
              <Plus className="w-4 h-4" /> New Assignment
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-900/60 p-1 rounded-2xl border border-gray-800 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: COURSES ─────────────────────────────────────────────────── */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {loadingCourses ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <div key={i} className="h-40 glass-card rounded-2xl animate-pulse" />)}</div>
            ) : courses.length === 0 ? (
              <EmptyState icon={BookOpen} text="No courses yet. Click 'New Course' to create your first course." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-indigo-500/40 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-sm font-bold text-white truncate">{course.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{course.department?.code || 'N/A'} · ${course.price}</p>
                      </div>
                      <StatusBadge status={course.status} />
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{course.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => loadLessons(course)} className="px-3 py-1.5 rounded-lg bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium hover:bg-indigo-800/40 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Modules ({course.lessons_count ?? '…'})
                      </button>
                      <button onClick={() => loadAssignments(course)} className="px-3 py-1.5 rounded-lg bg-amber-900/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium hover:bg-amber-800/30 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Assignments
                      </button>
                      <button onClick={() => loadQuizAttempts(course)} className="px-3 py-1.5 rounded-lg bg-purple-900/20 text-purple-300 border border-purple-500/30 text-[11px] font-medium hover:bg-purple-800/30 flex items-center gap-1">
                        <BarChart2 className="w-3 h-3" /> Quiz Monitor
                      </button>
                      <div className="ml-auto flex items-center gap-1">
                        <button onClick={() => openEditCourse(course)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteCourse(course.id)} className="p-1.5 rounded-lg hover:bg-rose-900/30 text-gray-400 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MODULES ─────────────────────────────────────────────────── */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            {!selectedCourse ? (
              <EmptyState icon={FileText} text="Select a course from 'My Courses' tab to manage its modules." />
            ) : loadingLessons ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />)}</div>
            ) : (
              <div className="space-y-3">
                {lessons.length === 0 && <EmptyState icon={FileText} text="No modules yet. Click 'Add Module' to create the first lesson." />}
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id}>
                    <div className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                            {lesson.position}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{lesson.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{lesson.content.slice(0, 80)}…</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {lesson.has_quiz ? (
                                <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                                  <HelpCircle className="w-3 h-3" /> Quiz Attached {lesson.quiz && `(${lesson.quiz.max_retries} retries)`}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-500">No quiz</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => openEditLesson(lesson)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white" title="Edit Module">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => quizEditingLessonId === lesson.id ? setQuizEditingLessonId(null) : openQuizEditor(lesson)}
                            className="p-1.5 rounded-lg hover:bg-amber-900/30 text-gray-400 hover:text-amber-300"
                            title={lesson.has_quiz ? 'Edit Quiz' : 'Attach Quiz'}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                          {lesson.has_quiz && (
                            <button onClick={() => deleteQuiz(lesson.id)} className="p-1.5 rounded-lg hover:bg-rose-900/30 text-gray-400 hover:text-rose-400" title="Remove Quiz">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => deleteLesson(lesson.id)} className="p-1.5 rounded-lg hover:bg-rose-900/30 text-gray-400 hover:text-rose-400" title="Delete Module">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quiz Builder Panel (inline, expanded) */}
                    {quizEditingLessonId === lesson.id && (
                      <div className="ml-6 mt-2 glass-card p-5 rounded-2xl border border-amber-500/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            {lesson.has_quiz ? 'Edit Quiz & Retry Settings' : 'Attach New Quiz'}
                          </h5>
                          <button onClick={() => setQuizEditingLessonId(null)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] text-gray-400 mb-1">Quiz Title</label>
                            <input value={quizForm.title} onChange={e => setQuizForm(p => ({...p, title: e.target.value}))}
                              className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Pass Score (%)</label>
                            <input type="number" min={1} max={100} value={quizForm.pass_score}
                              onChange={e => setQuizForm(p => ({...p, pass_score: +e.target.value}))}
                              className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Max Retries</label>
                            <input type="number" min={1} max={10} value={quizForm.max_retries}
                              onChange={e => setQuizForm(p => ({...p, max_retries: +e.target.value}))}
                              className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                            <p className="text-[10px] text-gray-500 mt-1">Students get this many attempts before being locked out</p>
                          </div>
                        </div>

                        <div>
                          <h6 className="text-xs font-semibold text-gray-300 mb-3">Questions ({quizForm.questions.length})</h6>
                          <QuizQuestionBuilder
                            questions={quizForm.questions}
                            onChange={(qs) => setQuizForm(p => ({...p, questions: qs}))}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <button onClick={() => setQuizEditingLessonId(null)} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs hover:bg-gray-800">
                            Cancel
                          </button>
                          <button onClick={saveQuiz} disabled={savingQuiz || quizForm.questions.length === 0} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-40">
                            {savingQuiz ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Quiz
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ASSIGNMENTS ─────────────────────────────────────────────── */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {!selectedCourse ? (
              <EmptyState icon={HelpCircle} text="Select a course from 'My Courses' tab to manage assignments." />
            ) : (
              <>
                {assignments.length === 0 && !showAssignmentForm && (
                  <EmptyState icon={HelpCircle} text="No assignments yet. Click 'New Assignment' to create the first one." />
                )}
                <div className="space-y-3">
                  {assignments.map((a) => (
                    <div key={a.id} className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-white truncate">{a.title}</h4>
                            <StatusBadge status={a.status} />
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2">{a.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No deadline'}</span>
                            <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Max Score: {a.max_score}</span>
                            <span className="flex items-center gap-1 text-indigo-400"><Users className="w-3 h-3" /> {a.submissions_count || 0} Submissions</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => viewSubmissions(a.id)} className="px-3 py-1.5 rounded-lg bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 text-[11px] flex items-center gap-1 hover:bg-indigo-800/40">
                            <Eye className="w-3 h-3" /> View Submissions
                          </button>
                          <button onClick={() => openEditAssignment(a)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteAssignment(a.id)} className="p-1.5 rounded-lg hover:bg-rose-900/30 text-gray-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submissions View */}
                {viewingSubmissionsForId && (
                  <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-indigo-300 flex items-center gap-2"><Users className="w-4 h-4" /> Student Submissions</h5>
                      <button onClick={() => setViewingSubmissionsForId(null)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    {submissions.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">No submissions yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {submissions.map((sub) => (
                          <div key={sub.id} className="p-4 rounded-xl bg-gray-950/50 border border-gray-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-white">{sub.user?.name} <span className="text-gray-400 font-normal">({sub.user?.email})</span></span>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={sub.status} />
                                {sub.score !== null && sub.score !== undefined && (
                                  <span className="text-emerald-400 font-bold">{sub.score} pts</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-3 bg-gray-900/40 p-2 rounded-lg">{sub.content}</p>
                            {sub.feedback && <p className="text-xs text-amber-300 italic">Feedback: {sub.feedback}</p>}
                            {sub.status === 'submitted' && (
                              <button
                                onClick={() => { setGradingSubmission(sub); setGradeForm({ score: 0, feedback: '' }); }}
                                className="px-3 py-1 rounded-lg bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium hover:bg-emerald-800/40"
                              >
                                Grade Submission
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TAB: QUIZ ATTEMPT MONITOR ─────────────────────────────────────── */}
        {activeTab === 'quiz-monitor' && (
          <div className="space-y-4">
            {!selectedCourse ? (
              <EmptyState icon={BarChart2} text="Select a course from 'My Courses' tab to monitor quiz attempts." />
            ) : loadingAttempts ? (
              <div className="h-40 glass-card rounded-2xl animate-pulse" />
            ) : quizAttempts.length === 0 ? (
              <EmptyState icon={BarChart2} text="No quiz attempts recorded yet for this course." />
            ) : (
              <div className="glass-card rounded-2xl border border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                  <h4 className="text-sm font-bold text-white">{selectedCourse.title} — Quiz Attempt Log</h4>
                  <button onClick={() => loadQuizAttempts(selectedCourse)} className="text-gray-400 hover:text-white p-1"><RefreshCw className="w-4 h-4" /></button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-950/60 border-b border-gray-800 text-gray-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Roll No</th>
                        <th className="px-4 py-3">Module / Quiz</th>
                        <th className="px-4 py-3">Attempt #</th>
                        <th className="px-4 py-3">Max Retries</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {quizAttempts.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-900/30">
                          <td className="px-4 py-3 font-medium text-white">{a.student_name}</td>
                          <td className="px-4 py-3 font-mono text-indigo-300">{a.roll_number}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-200">{a.lesson_title}</div>
                            <div className="text-gray-500">{a.quiz_title}</div>
                          </td>
                          <td className="px-4 py-3 font-bold text-center">
                            <span className={a.attempt_number >= a.max_retries && !a.passed ? 'text-rose-400' : 'text-gray-200'}>
                              {a.attempt_number}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">{a.max_retries}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${a.score_pct >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {a.score_pct}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {a.passed ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Passed</span>
                            ) : a.attempt_number >= a.max_retries ? (
                              <span className="flex items-center gap-1 text-rose-400 font-semibold"><AlertCircle className="w-3.5 h-3.5" /> Locked Out</span>
                            ) : (
                              <span className="text-amber-400 font-semibold">Failed ({a.max_retries - a.attempt_number} left)</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      {/* ── MODAL: Course Form ────────────────────────────────────────────── */}
      {showCourseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-indigo-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
              <button onClick={() => setShowCourseForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {[
              { label: 'Course Title', key: 'title', type: 'text', placeholder: 'e.g. Cyber Security Fundamentals' },
              { label: 'Price (USD)', key: 'price', type: 'number', placeholder: '0 for free' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                <input type={f.type} value={(courseForm as any)[f.key]} placeholder={f.placeholder}
                  onChange={e => setCourseForm(p => ({...p, [f.key]: e.target.value}))}
                  className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description</label>
              <textarea rows={3} value={courseForm.description} onChange={e => setCourseForm(p => ({...p, description: e.target.value}))}
                className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select value={courseForm.status} onChange={e => setCourseForm(p => ({...p, status: e.target.value}))}
                className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCourseForm(false)} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs hover:bg-gray-800">Cancel</button>
              <button onClick={saveCourse} disabled={saving} className="px-5 py-2 rounded-xl btn-primary text-white text-xs font-semibold flex items-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {editingCourse ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Lesson Form ────────────────────────────────────────────── */}
      {showLessonForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-indigo-500/30 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editingLesson ? 'Edit Module' : 'Add New Module'}</h3>
              <button onClick={() => setShowLessonForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Module Title</label>
                <input value={lessonForm.title} onChange={e => setLessonForm(p => ({...p, title: e.target.value}))}
                  placeholder="e.g. Module 1: Introduction to APIs"
                  className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Position Order</label>
                <input type="number" min={1} value={lessonForm.position} onChange={e => setLessonForm(p => ({...p, position: +e.target.value}))}
                  className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-end pb-1">
                <button
                  onClick={() => setLessonForm(p => ({...p, has_quiz: !p.has_quiz}))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all ${lessonForm.has_quiz ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-gray-700 text-gray-400'}`}
                >
                  {lessonForm.has_quiz ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {lessonForm.has_quiz ? 'Quiz Required' : 'No Quiz (Optional)'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Module Content</label>
              <textarea rows={8} value={lessonForm.content} onChange={e => setLessonForm(p => ({...p, content: e.target.value}))}
                placeholder="Write the full module content here. Students will read this before taking the quiz..."
                className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-y" />
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLessonForm(false)} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs hover:bg-gray-800">Cancel</button>
              <button onClick={saveLesson} disabled={saving} className="px-5 py-2 rounded-xl btn-primary text-white text-xs font-semibold flex items-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {editingLesson ? 'Save Changes' : 'Create Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Assignment Form ────────────────────────────────────────── */}
      {showAssignmentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-amber-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</h3>
              <button onClick={() => setShowAssignmentForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Assignment Title</label>
              <input value={assignmentForm.title} onChange={e => setAssignmentForm(p => ({...p, title: e.target.value}))}
                placeholder="e.g. Build a REST API Client"
                className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description / Instructions</label>
              <textarea rows={4} value={assignmentForm.description} onChange={e => setAssignmentForm(p => ({...p, description: e.target.value}))}
                placeholder="Describe what students need to submit..."
                className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Due Date</label>
                <input type="date" value={assignmentForm.due_date} onChange={e => setAssignmentForm(p => ({...p, due_date: e.target.value}))}
                  className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Score</label>
                <input type="number" min={1} value={assignmentForm.max_score} onChange={e => setAssignmentForm(p => ({...p, max_score: +e.target.value}))}
                  className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <select value={assignmentForm.status} onChange={e => setAssignmentForm(p => ({...p, status: e.target.value}))}
                  className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAssignmentForm(false)} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs hover:bg-gray-800">Cancel</button>
              <button onClick={saveAssignment} disabled={saving} className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {editingAssignment ? 'Save Changes' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Grade Submission ───────────────────────────────────────── */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-emerald-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Grade: {gradingSubmission.user?.name}</h3>
              <button onClick={() => setGradingSubmission(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 rounded-xl bg-gray-950/50 border border-gray-800 text-xs text-gray-300 max-h-32 overflow-y-auto">
              {gradingSubmission.content}
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Score</label>
              <input type="number" min={0} value={gradeForm.score} onChange={e => setGradeForm(p => ({...p, score: +e.target.value}))}
                className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Feedback (Optional)</label>
              <textarea rows={3} value={gradeForm.feedback} onChange={e => setGradeForm(p => ({...p, feedback: e.target.value}))}
                className="w-full px-3 py-2 text-xs bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setGradingSubmission(null)} className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 text-xs hover:bg-gray-800">Cancel</button>
              <button onClick={gradeSubmit} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Submit Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
