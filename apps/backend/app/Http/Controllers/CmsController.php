<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CmsController extends Controller
{
    private function requireStaffOrAdmin(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['STAFF', 'ADMIN'])) {
            abort(403, 'Only Staff or Admin can access the CMS.');
        }
        return $user;
    }

    // ─── COURSES ─────────────────────────────────────────────────────────────

    public function listCourses(Request $request)
    {
        $user = $this->requireStaffOrAdmin($request);
        $query = Course::with(['department', 'creator', 'lessons'])->withCount('lessons');
        if ($user->role === 'STAFF') {
            $query->where('created_by', $user->id);
        }
        $staffMembers = \App\Models\User::whereIn('role', ['STAFF', 'ADMIN'])->get();

        return response()->json([
            'courses' => $query->latest()->get(),
            'departments' => \App\Models\Department::all(),
            'staff_members' => $staffMembers,
        ]);
    }

    public function createCourse(Request $request)
    {
        $user = $this->requireStaffOrAdmin($request);
        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);
        $slug = Str::slug($request->title) . '-' . Str::random(5);
        $status = ($user->role === 'ADMIN') ? ($request->status ?? 'published') : 'pending_approval';

        $course = Course::create([
            'department_id' => $request->department_id,
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price,
            'status' => $status,
            'created_by' => $user->id,
        ]);

        $msg = ($status === 'pending_approval')
            ? 'Course created and submitted to Admin for approval.'
            : 'Course created and published.';

        return response()->json(['message' => $msg, 'course' => $course->load('department')], 201);
    }

    public function approveCourse(Request $request, $id)
    {
        $user = $this->requireStaffOrAdmin($request);
        if ($user->role !== 'ADMIN') {
            return response()->json(['message' => 'Only Admin can approve courses.'], 403);
        }
        $course = Course::findOrFail($id);
        $course->update(['status' => 'published']);
        return response()->json(['message' => 'Course approved and published!', 'course' => $course]);
    }

    public function rejectCourse(Request $request, $id)
    {
        $user = $this->requireStaffOrAdmin($request);
        if ($user->role !== 'ADMIN') {
            return response()->json(['message' => 'Only Admin can reject courses.'], 403);
        }
        $course = Course::findOrFail($id);
        $course->update(['status' => 'archived']);
        return response()->json(['message' => 'Course rejected.', 'course' => $course]);
    }

    public function assignMentor(Request $request, $id)
    {
        $user = $this->requireStaffOrAdmin($request);
        if ($user->role !== 'ADMIN') {
            return response()->json(['message' => 'Only Admin can re-assign course mentors.'], 403);
        }

        $course = Course::findOrFail($id);
        $request->validate([
            'staff_id' => 'required|exists:users,id',
        ]);

        $course->update(['created_by' => $request->staff_id]);

        return response()->json([
            'message' => 'Course instructor/mentor updated successfully.',
            'course' => $course->load(['department', 'creator']),
        ]);
    }

    public function updateCourse(Request $request, $id)
    {
        $user = $this->requireStaffOrAdmin($request);
        $course = Course::findOrFail($id);
        if ($user->role === 'STAFF' && $course->created_by !== $user->id) {
            return response()->json(['message' => 'You can only edit your own courses.'], 403);
        }
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:draft,published,archived',
        ]);
        $course->update($request->only(['title', 'description', 'price', 'status']));
        return response()->json(['message' => 'Course updated.', 'course' => $course]);
    }

    public function deleteCourse(Request $request, $id)
    {
        $user = $this->requireStaffOrAdmin($request);
        $course = Course::findOrFail($id);
        if ($user->role === 'STAFF' && $course->created_by !== $user->id) {
            return response()->json(['message' => 'You can only delete your own courses.'], 403);
        }
        $course->delete();
        return response()->json(['message' => 'Course deleted.']);
    }

    // ─── LESSONS ─────────────────────────────────────────────────────────────

    public function listLessons(Request $request, $courseId)
    {
        $this->requireStaffOrAdmin($request);
        $course = Course::findOrFail($courseId);
        return response()->json(['lessons' => $course->lessons()->with('quiz')->get()]);
    }

    public function createLesson(Request $request, $courseId)
    {
        $user = $this->requireStaffOrAdmin($request);
        $course = Course::findOrFail($courseId);
        if ($user->role === 'STAFF' && $course->created_by !== $user->id) {
            return response()->json(['message' => 'You can only add lessons to your own courses.'], 403);
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'position' => 'required|integer|min:1',
            'has_quiz' => 'boolean',
        ]);
        $lesson = Lesson::create([
            'course_id' => $courseId,
            'title' => $request->title,
            'content' => $request->content,
            'position' => $request->position,
            'has_quiz' => $request->has_quiz ?? false,
        ]);
        return response()->json(['message' => 'Lesson created.', 'lesson' => $lesson], 201);
    }

    public function updateLesson(Request $request, $lessonId)
    {
        $user = $this->requireStaffOrAdmin($request);
        $lesson = Lesson::with('course')->findOrFail($lessonId);
        if ($user->role === 'STAFF' && $lesson->course->created_by !== $user->id) {
            return response()->json(['message' => 'You can only edit lessons in your own courses.'], 403);
        }
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'position' => 'sometimes|required|integer|min:1',
            'has_quiz' => 'sometimes|boolean',
        ]);
        $lesson->update($request->only(['title', 'content', 'position', 'has_quiz']));
        return response()->json(['message' => 'Lesson updated.', 'lesson' => $lesson]);
    }

    public function deleteLesson(Request $request, $lessonId)
    {
        $user = $this->requireStaffOrAdmin($request);
        $lesson = Lesson::with('course')->findOrFail($lessonId);
        if ($user->role === 'STAFF' && $lesson->course->created_by !== $user->id) {
            return response()->json(['message' => 'You can only delete lessons in your own courses.'], 403);
        }
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted.']);
    }

    // ─── QUIZ ─────────────────────────────────────────────────────────────────

    public function upsertQuiz(Request $request, $lessonId)
    {
        $user = $this->requireStaffOrAdmin($request);
        $lesson = Lesson::with('course')->findOrFail($lessonId);
        if ($user->role === 'STAFF' && $lesson->course->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'pass_score' => 'required|integer|min:1|max:100',
            'max_retries' => 'required|integer|min:1|max:10',
            'questions_json' => 'required|array|min:1',
            'questions_json.*.question' => 'required|string',
            'questions_json.*.options' => 'required|array|min:2',
            'questions_json.*.correct' => 'required|integer|min:0',
        ]);
        $quiz = Quiz::updateOrCreate(
            ['lesson_id' => $lessonId],
            [
                'title' => $request->title,
                'pass_score' => $request->pass_score,
                'max_retries' => $request->max_retries,
                'questions_json' => $request->questions_json,
            ]
        );
        // Mark lesson as has_quiz = true
        $lesson->update(['has_quiz' => true]);
        return response()->json(['message' => 'Quiz saved.', 'quiz' => $quiz]);
    }

    public function deleteQuiz(Request $request, $lessonId)
    {
        $user = $this->requireStaffOrAdmin($request);
        $lesson = Lesson::with('course')->findOrFail($lessonId);
        if ($user->role === 'STAFF' && $lesson->course->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }
        Quiz::where('lesson_id', $lessonId)->delete();
        $lesson->update(['has_quiz' => false]);
        return response()->json(['message' => 'Quiz removed from lesson.']);
    }

    // ─── ASSIGNMENTS ─────────────────────────────────────────────────────────

    public function listAssignments(Request $request, $courseId)
    {
        $this->requireStaffOrAdmin($request);
        $assignments = Assignment::where('course_id', $courseId)
            ->withCount('submissions')
            ->latest()
            ->get();
        return response()->json(['assignments' => $assignments]);
    }

    public function createAssignment(Request $request, $courseId)
    {
        $user = $this->requireStaffOrAdmin($request);
        $course = Course::findOrFail($courseId);
        if ($user->role === 'STAFF' && $course->created_by !== $user->id) {
            return response()->json(['message' => 'You can only add assignments to your own courses.'], 403);
        }
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'due_date' => 'nullable|date',
            'max_score' => 'required|integer|min:1|max:1000',
            'status' => 'in:draft,published',
        ]);
        $assignment = Assignment::create([
            'course_id' => $courseId,
            'created_by' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'max_score' => $request->max_score ?? 100,
            'status' => $request->status ?? 'draft',
        ]);
        return response()->json(['message' => 'Assignment created.', 'assignment' => $assignment], 201);
    }

    public function updateAssignment(Request $request, $assignmentId)
    {
        $user = $this->requireStaffOrAdmin($request);
        $assignment = Assignment::findOrFail($assignmentId);
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'due_date' => 'nullable|date',
            'max_score' => 'sometimes|required|integer|min:1|max:1000',
            'status' => 'sometimes|in:draft,published',
        ]);
        $assignment->update($request->only(['title', 'description', 'due_date', 'max_score', 'status']));
        return response()->json(['message' => 'Assignment updated.', 'assignment' => $assignment]);
    }

    public function deleteAssignment(Request $request, $assignmentId)
    {
        $user = $this->requireStaffOrAdmin($request);
        $assignment = Assignment::findOrFail($assignmentId);
        $assignment->delete();
        return response()->json(['message' => 'Assignment deleted.']);
    }

    public function getSubmissions(Request $request, $assignmentId)
    {
        $this->requireStaffOrAdmin($request);
        $submissions = AssignmentSubmission::with('user')
            ->where('assignment_id', $assignmentId)
            ->latest()
            ->get();
        return response()->json(['submissions' => $submissions]);
    }

    public function gradeSubmission(Request $request, $submissionId)
    {
        $this->requireStaffOrAdmin($request);
        $request->validate([
            'score' => 'required|integer|min:0',
            'feedback' => 'nullable|string',
        ]);
        $submission = AssignmentSubmission::findOrFail($submissionId);
        $submission->update([
            'score' => $request->score,
            'feedback' => $request->feedback,
            'status' => 'graded',
        ]);
        return response()->json(['message' => 'Submission graded.', 'submission' => $submission]);
    }

    // ─── QUIZ ATTEMPT MONITOR ────────────────────────────────────────────────

    public function quizAttemptMonitor(Request $request, $courseId)
    {
        $this->requireStaffOrAdmin($request);
        $course = Course::with('lessons.quiz.attempts.user')->findOrFail($courseId);
        $attempts = collect();
        foreach ($course->lessons as $lesson) {
            if ($lesson->quiz) {
                foreach ($lesson->quiz->attempts as $attempt) {
                    $attempts->push([
                        'lesson_title' => $lesson->title,
                        'quiz_title' => $lesson->quiz->title,
                        'max_retries' => $lesson->quiz->max_retries,
                        'student_name' => $attempt->user->name ?? 'Unknown',
                        'student_email' => $attempt->user->email ?? '',
                        'roll_number' => $attempt->user->roll_number ?? 'N/A',
                        'attempt_number' => $attempt->attempt_number,
                        'score_pct' => $attempt->score_pct,
                        'passed' => $attempt->passed,
                        'created_at' => $attempt->created_at,
                    ]);
                }
            }
        }
        return response()->json(['attempts' => $attempts->sortByDesc('created_at')->values()]);
    }
}
