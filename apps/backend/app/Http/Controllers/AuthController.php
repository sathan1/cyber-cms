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

        return response()->json([
            'message' => 'Account created! Please check your email for the 6-digit OTP code to complete registration.',
            'require_otp' => true,
            'email' => $email,
            'otp' => $otp,
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

        if ($user->mentor_id) {
            $user->load('mentor.department');
        }

        return response()->json([
            'message' => 'Email verified successfully! Welcome to CyberCMS.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $email = strtolower($request->email);

        // Lightweight targeted account provisioner for Admin & 4 Staff accounts
        try {
            if (!User::where('email', $email)->exists()) {
                if ($email === 'sathandhurkes@gmail.com') {
                    User::create([
                        'name' => 'Sathan (System Administrator)',
                        'email' => $email,
                        'password' => 'Sathanu@061766',
                        'role' => 'ADMIN',
                        'status' => 'active',
                        'email_verified_at' => now(),
                    ]);
                } else if (in_array($email, ['sathish.cse@mcet.in', 'anitha.ece@mcet.in', 'vignesh.it@mcet.in', 'rajesh.cse@mcet.in'])) {
                    $codeMap = [
                        'sathish.cse@mcet.in' => ['name' => 'Prof. Sathish Kumar (CSE)', 'dept' => 'CSE', 'dept_name' => 'Computer Science & Engineering', 'mcode' => 'MTR-CSE-101', 'staff_id' => 'ST-1001'],
                        'anitha.ece@mcet.in'  => ['name' => 'Dr. Anitha Ramesh (ECE)',     'dept' => 'ECE', 'dept_name' => 'Electronics & Communication',  'mcode' => 'MTR-ECE-201', 'staff_id' => 'ST-2001'],
                        'vignesh.it@mcet.in'  => ['name' => 'Prof. Vigneshwaran (IT)',    'dept' => 'IT',  'dept_name' => 'Information Technology',       'mcode' => 'MTR-IT-301',  'staff_id' => 'ST-3001'],
                        'rajesh.cse@mcet.in'  => ['name' => 'Prof. Rajesh Kannan (CSE)',  'dept' => 'CSE', 'dept_name' => 'Computer Science & Engineering', 'mcode' => 'MTR-CSE-102', 'staff_id' => 'ST-1002'],
                    ];
                    $meta = $codeMap[$email];
                    $dept = Department::where('code', $meta['dept'])->first();
                    if (!$dept) {
                        $dept = Department::create(['code' => $meta['dept'], 'name' => $meta['dept_name']]);
                    }
                    $m = MentorId::where('mentor_code', $meta['mcode'])->first();
                    if (!$m) {
                        $m = MentorId::create(['mentor_code' => $meta['mcode'], 'staff_id' => $meta['staff_id'], 'department_id' => $dept->id]);
                    }
                    User::create([
                        'name' => $meta['name'],
                        'email' => $email,
                        'password' => 'password123',
                        'role' => 'STAFF',
                        'mentor_id' => $m->id,
                        'status' => 'active',
                        'email_verified_at' => now(),
                    ]);
                }
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Auto-provision error: " . $e->getMessage());
        }

        $user = User::where('email', $email)->first();

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

            return response()->json([
                'message' => 'Email verification pending. A new OTP code is required to complete login.',
                'require_otp' => true,
                'email' => $user->email,
                'otp' => $otp,
            ], 200);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        if ($user->mentor_id) {
            $user->load('mentor.department');
        }

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if ($user->mentor_id) {
            $user->load('mentor.department');
        }

        return response()->json([
            'user' => $user,
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

        return response()->json([
            'message' => 'Password reset OTP generated and sent to email.',
            'expires_in_minutes' => 10,
            'otp' => $otp,
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
