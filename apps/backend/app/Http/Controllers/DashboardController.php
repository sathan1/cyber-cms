<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\Payment;
use App\Models\Remark;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function studentMetrics(Request $request)
    {
        $user = $request->user();

        $enrollments = Enrollment::with(['course.lessons', 'course.department', 'course.creator'])
            ->where('user_id', $user->id)
            ->get();

        $completedLessonsCount = LessonProgress::where('user_id', $user->id)->count();

        // Calculate accurate consecutive-day active learning streak
        $dates = LessonProgress::where('user_id', $user->id)
            ->selectRaw('DATE(created_at) as date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date');

        $streakDays = 0;
        if ($dates->count() > 0) {
            $today = \Carbon\Carbon::today()->toDateString();
            $yesterday = \Carbon\Carbon::yesterday()->toDateString();

            if ($dates->contains($today) || $dates->contains($yesterday)) {
                $checkDate = $dates->contains($today)
                    ? \Carbon\Carbon::today()
                    : \Carbon\Carbon::yesterday();

                while ($dates->contains($checkDate->toDateString())) {
                    $streakDays++;
                    $checkDate->subDay();
                }
            }
        }

        $remarks = Remark::with(['course', 'mentor.department', 'replier'])
            ->where('student_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'user' => $user->load('mentor.department'),
            'streak_days' => $streakDays,
            'completed_lessons_count' => $completedLessonsCount,
            'enrollments' => $enrollments,
            'remarks' => $remarks,
        ]);
    }

    public function mentorMetrics(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'STAFF' && $user->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $mentorId = $user->mentor_id;

        // Cohort breakdown
        $studentsQuery = User::where('role', 'STUDENT');
        if ($mentorId) {
            $studentsQuery->where('mentor_id', $mentorId);
        }
        $students = $studentsQuery->with('enrollments.course')->get();

        $cohorts = [
            'year_1' => $students->where('year', 1)->values(),
            'year_2' => $students->where('year', 2)->values(),
            'year_3' => $students->where('year', 3)->values(),
            'year_4' => $students->where('year', 4)->values(),
        ];

        // Risk Watchlist: Students with average progress < 30%
        $watchlist = $students->filter(function ($student) {
            if ($student->enrollments->isEmpty()) return true;
            $avg = $student->enrollments->avg('progress_pct');
            return $avg < 30;
        })->map(function ($student) {
            $avg = $student->enrollments->avg('progress_pct') ?? 0;
            return [
                'id' => $student->id,
                'name' => $student->name,
                'roll_number' => $student->roll_number,
                'year' => $student->year,
                'avg_progress' => round($avg, 1),
                'risk_level' => $avg == 0 ? 'CRITICAL' : 'WARNING',
            ];
        })->values();

        $remarksQuery = Remark::with(['student', 'course']);
        if ($mentorId) {
            $remarksQuery->where('mentor_id', $mentorId);
        }
        $remarks = $remarksQuery->latest()->get();

        return response()->json([
            'total_students' => $students->count(),
            'cohorts' => [
                'year_1_count' => count($cohorts['year_1']),
                'year_2_count' => count($cohorts['year_2']),
                'year_3_count' => count($cohorts['year_3']),
                'year_4_count' => count($cohorts['year_4']),
            ],
            'students_by_cohort' => $cohorts,
            'risk_watchlist' => $watchlist,
            'remarks' => $remarks,
        ]);
    }

    public function adminMetrics(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        $userCounts = [
            'admin' => User::where('role', 'ADMIN')->count(),
            'staff' => User::where('role', 'STAFF')->count(),
            'student' => User::where('role', 'STUDENT')->count(),
            'paid_user' => User::where('role', 'PAID_USER')->count(),
            'total' => User::count(),
        ];

        $totalRevenue = Payment::where('status', 'successful')->sum('amount');
        $recentPayments = Payment::with(['user', 'course'])->latest()->take(10)->get();
        $allCourses = Course::with(['department', 'creator'])->get();

        return response()->json([
            'user_counts' => $userCounts,
            'total_revenue' => $totalRevenue,
            'recent_payments' => $recentPayments,
            'courses' => $allCourses,
            'cms_branding' => [
                'platform_name' => 'CyberCMS E-Learning Platform',
                'institution_code' => 'CYBER-CMS-2026',
                'verified_domain' => 'All Email Domains Supported',
                'primary_color' => '#4f46e5',
            ],
        ]);
    }
}
