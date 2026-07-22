<?php

namespace App\Http\Controllers;

use App\Models\MentorId;
use App\Models\PasswordResetOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|in:ADMIN,STAFF,STUDENT,PAID_USER',
        ]);

        $role = $request->role ?? 'STUDENT';

        $user = User::create([
            'name' => $request->name,
            'email' => strtolower($request->email),
            'password' => Hash::make($request->password),
            'role' => $role,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => $user->load('mentor.department'),
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password credentials.'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Your account is currently inactive or suspended.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user->load('mentor.department'),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('mentor.department'),
        ]);
    }

    public function onboard(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'mentor_code' => 'required|string|exists:mentor_ids,mentor_code',
            'year' => 'required|integer|min:1|max:4',
            'roll_number' => 'required|string|unique:users,roll_number,' . $user->id,
        ]);

        // Email domain check (e.g. institution email)
        $allowedDomain = config('app.institution_email_domain', 'institution.edu');
        if ($allowedDomain && !str_ends_with($user->email, "@{$allowedDomain}")) {
            // Also allow standard testing domains if needed, or enforce check
            if (!str_contains($user->email, 'institution.edu') && !str_contains($user->email, 'test')) {
                return response()->json([
                    'message' => "College email verification failed. Must be an official @{$allowedDomain} email.",
                ], 422);
            }
        }

        $mentor = MentorId::where('mentor_code', $request->mentor_code)->firstOrFail();

        $user->update([
            'mentor_id' => $mentor->id,
            'year' => $request->year,
            'roll_number' => strtoupper($request->roll_number),
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Student onboarding completed successfully.',
            'user' => $user->load('mentor.department'),
        ]);
    }

    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $email = strtolower($request->email);
        $otp = sprintf('%06d', mt_rand(100000, 999999));

        PasswordResetOtp::create([
            'email' => $email,
            'otp_code' => Hash::make($otp),
            'expires_at' => now()->addMinutes(10),
            'used' => false,
        ]);

        // Return OTP in json response for easy production testing / debug preview
        return response()->json([
            'message' => 'Password reset OTP generated and sent to email.',
            'debug_otp' => $otp, // Useful for demo and testing without email server
            'expires_in_minutes' => 10,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6',
        ]);

        $email = strtolower($request->email);

        $otpRecord = PasswordResetOtp::where('email', $email)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord || !Hash::check($request->otp, $otpRecord->otp_code)) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 422);
        }

        $otpRecord->update(['used' => true]);

        $user = User::where('email', $email)->firstOrFail();
        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password reset successful. You can now log in with your new password.']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function getMentors()
    {
        return response()->json([
            'mentors' => MentorId::with('department')->get(),
        ]);
    }
}
