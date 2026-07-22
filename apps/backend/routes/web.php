<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;

Route::options('/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
})->where('any', '.*');

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'message' => 'CyberCMS Laravel API Service is Running Live!',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::get('/api', function () {
    return response()->json([
        'status' => 'online',
        'message' => 'CyberCMS API Base Endpoint',
    ]);
});

// Fallback mirror routes to ensure zero 404 HTML errors on both root & /api prefixes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/courses', [CourseController::class, 'index']);
