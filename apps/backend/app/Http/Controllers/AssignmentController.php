<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    /**
     * List all published assignments for courses the student is enrolled in.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $enrolledCourseIds = Enrollment::where('user_id', $user->id)->pluck('course_id');

        $assignments = Assignment::with(['course:id,title,slug'])
            ->whereIn('course_id', $enrolledCourseIds)
            ->where('status', 'published')
            ->orderBy('due_date', 'asc')
            ->get()
            ->map(function ($assignment) use ($user) {
                $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                    ->where('user_id', $user->id)
                    ->first();
                $assignment->my_submission = $submission;
                return $assignment;
            });

        return response()->json(['assignments' => $assignments]);
    }

    /**
     * Submit an assignment (one submission per student per assignment).
     */
    public function submit(Request $request, $assignmentId)
    {
        $user = $request->user();
        $assignment = Assignment::findOrFail($assignmentId);

        // Check enrollment
        $enrolled = Enrollment::where('user_id', $user->id)
            ->where('course_id', $assignment->course_id)
            ->exists();
        if (!$enrolled) {
            return response()->json(['message' => 'You are not enrolled in this course.'], 403);
        }

        // Check due date
        if ($assignment->due_date && now()->isAfter($assignment->due_date)) {
            return response()->json(['message' => 'Submission deadline has passed.'], 422);
        }

        $request->validate([
            'content' => 'required|string|min:10',
        ]);

        $submission = AssignmentSubmission::updateOrCreate(
            ['assignment_id' => $assignmentId, 'user_id' => $user->id],
            [
                'content' => $request->content,
                'status' => 'submitted',
                'submitted_at' => now(),
                'score' => null,
                'feedback' => null,
            ]
        );

        return response()->json([
            'message' => 'Assignment submitted successfully.',
            'submission' => $submission,
        ], 201);
    }

    /**
     * Get current user's own submission for an assignment.
     */
    public function mySubmission(Request $request, $assignmentId)
    {
        $user = $request->user();
        $submission = AssignmentSubmission::where('assignment_id', $assignmentId)
            ->where('user_id', $user->id)
            ->first();

        return response()->json(['submission' => $submission]);
    }
}
