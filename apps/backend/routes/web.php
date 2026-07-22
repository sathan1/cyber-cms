<?php

use Illuminate\Support\Facades\Route;

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
