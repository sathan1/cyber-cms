<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $courses = Course::with(['department', 'creator', 'lessons'])
            ->where('status', 'published')
            ->get();

        $user = $request->user() ?? auth('sanctum')->user();

        if ($user) {
            $userEnrollments = Enrollment::where('user_id', $user->id)
                ->pluck('progress_pct', 'course_id');

            $courses->transform(function ($course) use ($userEnrollments, $user) {
                $isEnrolled = isset($userEnrollments[$course->id]) || $course->price == 0 || in_array($user->role, ['ADMIN', 'STAFF']);
                $course->is_enrolled = $isEnrolled;
                $course->progress_pct = $userEnrollments[$course->id] ?? ($isEnrolled ? 100 : 0);
                return $course;
            });
        }

        return response()->json(['courses' => $courses]);
    }

    public function show(Request $request, $slug)
    {
        $course = Course::with(['department', 'creator', 'lessons.quiz', 'assignments'])
            ->where('slug', $slug)
            ->firstOrFail();

        $user = $request->user() ?? auth('sanctum')->user();
        $isEnrolled = false;
        $progressPct = 0;
        $completedLessonIds = [];
        $quizAttemptMap = [];

        if ($user) {
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if ($enrollment) {
                $isEnrolled = true;
                $progressPct = (float) $enrollment->progress_pct;
            }

            $completedLessonIds = LessonProgress::where('user_id', $user->id)
                ->whereIn('lesson_id', $course->lessons->pluck('id'))
                ->pluck('lesson_id')
                ->toArray();

            // Build attempt map per quiz for this user
            $quizIds = $course->lessons->pluck('quiz.id')->filter()->values();
            $attempts = QuizAttempt::where('user_id', $user->id)
                ->whereIn('quiz_id', $quizIds)
                ->get()
                ->groupBy('quiz_id');

            foreach ($attempts as $quizId => $quizAttempts) {
                $quizAttemptMap[$quizId] = [
                    'total_attempts' => $quizAttempts->count(),
                    'passed' => $quizAttempts->where('passed', true)->count() > 0,
                    'best_score' => $quizAttempts->max('score_pct'),
                ];
            }
        }

        $canAccess = $isEnrolled || $course->price == 0 || in_array($user?->role, ['ADMIN', 'STAFF']);

        return response()->json([
            'course' => $course,
            'is_enrolled' => $canAccess,
            'progress_pct' => $progressPct,
            'completed_lesson_ids' => $completedLessonIds,
            'quiz_attempt_map' => $quizAttemptMap,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user || !in_array($user->role, ['ADMIN', 'STAFF'])) {
            return response()->json(['message' => 'Unauthorized. Only Staff or Admin can create courses.'], 403);
        }

        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);

        $slug = Str::slug($request->title) . '-' . Str::random(5);

        $course = Course::create([
            'department_id' => $request->department_id,
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price,
            'status' => 'published',
            'created_by' => $user->id,
        ]);

        return response()->json(['message' => 'Course created successfully', 'course' => $course], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user || !in_array($user->role, ['ADMIN', 'STAFF'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $course = Course::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:draft,published,archived',
        ]);

        $course->update($request->only(['title', 'description', 'price', 'status']));

        return response()->json(['message' => 'Course updated successfully', 'course' => $course]);
    }

    public function markLessonComplete(Request $request, $lessonId)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $lesson = Lesson::with('course.lessons')->findOrFail($lessonId);

        // If lesson has a quiz, ensure the student has passed it before marking complete
        if ($lesson->has_quiz) {
            $quiz = Quiz::where('lesson_id', $lesson->id)->first();
            if ($quiz) {
                $passed = QuizAttempt::where('user_id', $user->id)
                    ->where('quiz_id', $quiz->id)
                    ->where('passed', true)
                    ->exists();
                if (!$passed) {
                    return response()->json([
                        'message' => 'You must pass this lesson\'s knowledge check before marking it complete.',
                    ], 422);
                }
            }
        }

        LessonProgress::firstOrCreate([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ], [
            'completed_at' => now(),
        ]);

        $course = $lesson->course;
        $totalLessons = $course->lessons->count();

        $completedLessonIds = LessonProgress::where('user_id', $user->id)
            ->whereIn('lesson_id', $course->lessons->pluck('id'))
            ->pluck('lesson_id')
            ->toArray();

        $completedCount = count($completedLessonIds);
        $pct = $totalLessons > 0 ? round(($completedCount / $totalLessons) * 100, 2) : 0;

        Enrollment::updateOrCreate([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ], [
            'progress_pct' => $pct,
            'completed_at' => $pct >= 100 ? now() : null,
        ]);

        return response()->json([
            'message' => 'Lesson marked as completed. Next module unlocked!',
            'lesson_id' => $lesson->id,
            'course_id' => $course->id,
            'progress_pct' => $pct,
            'completed_lesson_ids' => $completedLessonIds,
        ]);
    }

    public function submitQuiz(Request $request, $quizId)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $request->validate([
            'answers' => 'required|array',
        ]);

        $quiz = Quiz::with('lesson.course.lessons')->findOrFail($quizId);
        $questions = $quiz->questions_json ?? [];

        $totalQuestions = count($questions);
        if ($totalQuestions === 0) {
            return response()->json(['message' => 'No questions found in this quiz.'], 400);
        }

        // Check attempt count and retry limits
        $pastAttempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quizId)
            ->get();

        $attemptCount = $pastAttempts->count();
        $alreadyPassed = $pastAttempts->where('passed', true)->count() > 0;

        if (!$alreadyPassed && $attemptCount >= $quiz->max_retries) {
            return response()->json([
                'message' => 'Maximum retry limit reached. Contact your mentor to request a reset.',
                'retries_exhausted' => true,
                'max_retries' => $quiz->max_retries,
                'attempt_number' => $attemptCount,
            ], 422);
        }

        // Score the quiz
        $correctCount = 0;
        foreach ($questions as $idx => $q) {
            $userAns = $request->answers[$idx] ?? null;
            if ($userAns !== null && (int) $userAns === (int) $q['correct']) {
                $correctCount++;
            }
        }

        $scorePct = round(($correctCount / $totalQuestions) * 100);
        $passed = $scorePct >= $quiz->pass_score;
        $currentAttemptNumber = $attemptCount + 1;

        // Log attempt
        QuizAttempt::create([
            'quiz_id' => $quizId,
            'user_id' => $user->id,
            'answers_json' => $request->answers,
            'score_pct' => $scorePct,
            'passed' => $passed,
            'attempt_number' => $currentAttemptNumber,
        ]);

        $completedLessonIds = [];
        $progressPct = 0;

        if ($passed) {
            LessonProgress::firstOrCreate([
                'user_id' => $user->id,
                'lesson_id' => $quiz->lesson_id,
            ], ['completed_at' => now()]);

            $course = $quiz->lesson->course;
            $totalLessons = $course->lessons->count();

            $completedLessonIds = LessonProgress::where('user_id', $user->id)
                ->whereIn('lesson_id', $course->lessons->pluck('id'))
                ->pluck('lesson_id')
                ->toArray();

            $progressPct = $totalLessons > 0 ? round((count($completedLessonIds) / $totalLessons) * 100, 2) : 0;

            Enrollment::updateOrCreate([
                'user_id' => $user->id,
                'course_id' => $course->id,
            ], [
                'progress_pct' => $progressPct,
                'completed_at' => $progressPct >= 100 ? now() : null,
            ]);
        }

        $retriesRemaining = max(0, $quiz->max_retries - $currentAttemptNumber);

        return response()->json([
            'score_pct' => $scorePct,
            'passed' => $passed,
            'pass_score' => $quiz->pass_score,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'attempt_number' => $currentAttemptNumber,
            'max_retries' => $quiz->max_retries,
            'retries_remaining' => $passed ? null : $retriesRemaining,
            'retries_exhausted' => !$passed && $retriesRemaining <= 0,
            'progress_pct' => $progressPct,
            'completed_lesson_ids' => $completedLessonIds,
            'message' => $passed
                ? 'Congratulations! You passed. Next module is now unlocked.'
                : ($retriesRemaining > 0
                    ? "Incorrect. You have {$retriesRemaining} retries remaining."
                    : 'No retries remaining. Contact your mentor.'),
        ]);
    }
}
