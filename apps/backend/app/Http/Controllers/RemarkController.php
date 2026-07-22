<?php

namespace App\Http\Controllers;

use App\Models\Remark;
use Illuminate\Http\Request;

class RemarkController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Remark::with(['student', 'mentor.department', 'course', 'replier']);

        if ($user->role === 'STUDENT') {
            $query->where('student_id', $user->id);
        } elseif ($user->role === 'STAFF') {
            if ($user->mentor_id) {
                $query->where('mentor_id', $user->mentor_id);
            }
            if ($request->has('year') && $request->year != '') {
                $query->where('year', $request->year);
            }
            if ($request->has('status') && $request->status != '') {
                $query->where('status', $request->status);
            }
            if ($request->has('roll_number') && $request->roll_number != '') {
                $query->where('roll_number', 'LIKE', '%' . $request->roll_number . '%');
            }
        }

        $remarks = $query->latest()->get();

        return response()->json(['remarks' => $remarks]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'STUDENT') {
            return response()->json(['message' => 'Only registered students can submit remarks/questions.'], 403);
        }

        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'question' => 'required|string|min:5',
        ]);

        $remark = Remark::create([
            'student_id' => $user->id,
            'roll_number' => $user->roll_number ?? 'UNASSIGNED',
            'mentor_id' => $user->mentor_id,
            'year' => $user->year ?? 1,
            'course_id' => $request->course_id,
            'question' => $request->question,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Question submitted to your mentor successfully.',
            'remark' => $remark->load(['course', 'mentor']),
        ], 201);
    }

    public function reply(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'STAFF' && $user->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized. Only Staff or Admin can post replies.'], 403);
        }

        $request->validate([
            'reply' => 'required|string|min:2',
        ]);

        $remark = Remark::findOrFail($id);
        $remark->update([
            'reply' => $request->reply,
            'replied_by' => $user->id,
            'status' => 'replied',
        ]);

        return response()->json([
            'message' => 'Reply posted successfully.',
            'remark' => $remark->load(['student', 'replier']),
        ]);
    }
}
