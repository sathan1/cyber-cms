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
            'mentor_code' => 'nullable|string',
        ]);

        $email = strtolower($request->email);
        $role = $request->role ?? 'STUDENT';

        // Backend domain restriction check for Student and Staff
        if ($role === 'STUDENT' || $role === 'STAFF') {
            if (!str_ends_with($email, '@mcet.in') && !str_ends_with($email, '@drmcet.ac.in')) {
                return response()->json([
                    'message' => 'Please use your valid institutional email address to register.',
                ], 422);
            }
        }

        // Mentor code validation for Staff
        $mentorId = null;
        if ($role === 'STAFF') {
            if ($request->mentor_code) {
                $mentor = MentorId::where('mentor_code', $request->mentor_code)
                    ->orWhere('staff_id', $request->mentor_code)
                    ->first();
                if (!$mentor) {
                    return response()->json([
                        'message' => 'Invalid Staff Mentor ID or Staff Code.',
                    ], 422);
                }
                $mentorId = $mentor->id;
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'mentor_id' => $mentorId,
            'status' => 'active',
            'email_verified_at' => null, // Requires OTP verification
        ]);

        // Generate 6-digit OTP code for email verification
        $otp = sprintf('%06d', mt_rand(100000, 999999));
        PasswordResetOtp::create([
            'email' => $email,
            'otp_code' => Hash::make($otp),
            'expires_at' => now()->addMinutes(15),
            'used' => false,
        ]);

        try {
            \Illuminate\Support\Facades\Mail::raw("Your CyberCMS Verification OTP code is: {$otp}. Valid for 15 minutes.", function ($message) use ($email) {
                $message->to($email)->subject('CyberCMS Email Verification OTP');
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::info("OTP Mail dispatch for {$email}: {$otp}");
        }

        return response()->json([
            'message' => 'Account created! Please check your email for the 6-digit OTP code to complete registration.',
            'require_otp' => true,
            'email' => $email,
        ], 201);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $email = strtolower($request->email);

        $otpRecord = PasswordResetOtp::where('email', $email)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord || !Hash::check($request->otp, $otpRecord->otp_code)) {
            return response()->json(['message' => 'Invalid or expired OTP verification code.'], 422);
        }

        $otpRecord->update(['used' => true]);

        $user = User::where('email', $email)->firstOrFail();
        $user->update(['email_verified_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully! Welcome to CyberCMS.',
            'token' => $token,
            'user' => $user->load('mentor.department'),
        ]);
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

        // If email not yet verified, send new OTP and prompt verification
        if (!$user->email_verified_at) {
            $otp = sprintf('%06d', mt_rand(100000, 999999));
            PasswordResetOtp::create([
                'email' => $user->email,
                'otp_code' => Hash::make($otp),
                'expires_at' => now()->addMinutes(15),
                'used' => false,
            ]);

            try {
                \Illuminate\Support\Facades\Mail::raw("Your CyberCMS Verification OTP code is: {$otp}. Valid for 15 minutes.", function ($message) use ($user) {
                    $message->to($user->email)->subject('CyberCMS Email Verification OTP');
                });
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::info("OTP Mail dispatch for {$user->email}: {$otp}");
            }

            return response()->json([
                'message' => 'Email verification pending. A new OTP has been sent to your email.',
                'require_otp' => true,
                'email' => $user->email,
            ], 403);
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

        try {
            \Illuminate\Support\Facades\Mail::raw("Your CyberCMS Password Reset OTP code is: {$otp}. Valid for 10 minutes.", function ($message) use ($email) {
                $message->to($email)->subject('CyberCMS Password Reset OTP');
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::info("Password Reset OTP Mail dispatch for {$email}: {$otp}");
        }

        return response()->json([
            'message' => 'Password reset OTP generated and sent to email.',
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
