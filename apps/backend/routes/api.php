<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CmsController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RemarkController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/mentors', [AuthController::class, 'getMentors']);

// Public Course Catalog
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{slug}', [CourseController::class, 'show']);

// Protected Routes (Sanctum Token Authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Auth & Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/onboard', [AuthController::class, 'onboard']);

    // Learning Progress & Quiz Submission
    Route::post('/lessons/{id}/complete', [CourseController::class, 'markLessonComplete']);
    Route::post('/quizzes/{id}/submit', [CourseController::class, 'submitQuiz']);

    // Legacy Course CRUD (kept for backward compat)
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);

    // Remarks & Replies
    Route::get('/remarks', [RemarkController::class, 'index']);
    Route::post('/remarks', [RemarkController::class, 'store']);
    Route::post('/remarks/{id}/reply', [RemarkController::class, 'reply']);

    // Razorpay Payments
    Route::post('/payments/order', [PaymentController::class, 'createOrder']);
    Route::post('/payments/verify', [PaymentController::class, 'verifyPayment']);

    // Dashboards
    Route::get('/dashboard/student', [DashboardController::class, 'studentMetrics']);
    Route::get('/dashboard/mentor', [DashboardController::class, 'mentorMetrics']);
    Route::get('/dashboard/admin', [DashboardController::class, 'adminMetrics']);

    // ─────────────────────────────────────────────────────────────────────────
    // CMS Routes (Staff & Admin Only)
    // ─────────────────────────────────────────────────────────────────────────
    Route::prefix('cms')->group(function () {
        // Course CRUD
        Route::get('/courses', [CmsController::class, 'listCourses']);
        Route::post('/courses', [CmsController::class, 'createCourse']);
        Route::put('/courses/{id}', [CmsController::class, 'updateCourse']);
        Route::delete('/courses/{id}', [CmsController::class, 'deleteCourse']);

        // Lesson CRUD
        Route::get('/courses/{courseId}/lessons', [CmsController::class, 'listLessons']);
        Route::post('/courses/{courseId}/lessons', [CmsController::class, 'createLesson']);
        Route::put('/lessons/{id}', [CmsController::class, 'updateLesson']);
        Route::delete('/lessons/{id}', [CmsController::class, 'deleteLesson']);

        // Quiz Attachment per Lesson
        Route::post('/lessons/{lessonId}/quiz', [CmsController::class, 'upsertQuiz']);
        Route::delete('/lessons/{lessonId}/quiz', [CmsController::class, 'deleteQuiz']);

        // Assignment CRUD
        Route::get('/courses/{courseId}/assignments', [CmsController::class, 'listAssignments']);
        Route::post('/courses/{courseId}/assignments', [CmsController::class, 'createAssignment']);
        Route::put('/assignments/{id}', [CmsController::class, 'updateAssignment']);
        Route::delete('/assignments/{id}', [CmsController::class, 'deleteAssignment']);

        // Assignment Grading
        Route::get('/assignments/{id}/submissions', [CmsController::class, 'getSubmissions']);
        Route::put('/submissions/{id}/grade', [CmsController::class, 'gradeSubmission']);

        // Quiz Attempt Monitor
        Route::get('/courses/{courseId}/quiz-attempts', [CmsController::class, 'quizAttemptMonitor']);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Student Assignment Routes
    // ─────────────────────────────────────────────────────────────────────────
    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::post('/assignments/{id}/submit', [AssignmentController::class, 'submit']);
    Route::get('/assignments/{id}/submission', [AssignmentController::class, 'mySubmission']);
});
