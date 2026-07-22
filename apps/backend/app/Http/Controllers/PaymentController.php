<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function getSettings()
    {
        $settings = PlatformSetting::firstOrCreate(
            ['id' => 1],
            ['upi_id' => 'admin@upi', 'bank_details' => 'Bank: SBI\nAcc: 123456789\nIFSC: SBIN0001']
        );
        return response()->json($settings);
    }

    public function submitManualPayment(Request $request)
    {
        $user = $request->user();
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'utr_number' => 'required|string|min:12|max:12',
        ]);

        $course = Course::findOrFail($request->course_id);

        $payment = Payment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'utr_number' => $request->utr_number,
            'payment_method' => 'upi',
            'amount' => $course->price,
            'status' => 'pending_verification',
        ]);

        return response()->json([
            'message' => 'Payment submitted successfully. Please wait for admin verification.',
            'payment_id' => $payment->id,
        ]);
    }

    public function getPendingPayments(Request $request)
    {
        if ($request->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payments = Payment::with(['user', 'course'])
            ->where('status', 'pending_verification')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }

    public function verifyManualPayment(Request $request, $id)
    {
        if ($request->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'action' => 'required|in:approve,reject'
        ]);

        $payment = Payment::findOrFail($id);

        if ($request->action === 'approve') {
            $payment->update([
                'status' => 'successful',
                'verified_by_admin_id' => $request->user()->id
            ]);

            Enrollment::firstOrCreate([
                'user_id' => $payment->user_id,
                'course_id' => $payment->course_id,
            ], [
                'progress_pct' => 0.00,
            ]);

            return response()->json(['message' => 'Payment approved and course unlocked!']);
        } else {
            $payment->update([
                'status' => 'failed',
                'verified_by_admin_id' => $request->user()->id
            ]);

            return response()->json(['message' => 'Payment rejected.']);
        }
    }

    public function updateSettings(Request $request)
    {
        if ($request->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'upi_id' => 'required|string',
            'bank_details' => 'required|string',
        ]);

        $settings = PlatformSetting::firstOrCreate(['id' => 1]);
        $settings->update([
            'upi_id' => $request->upi_id,
            'bank_details' => $request->bank_details,
        ]);

        return response()->json(['message' => 'Settings updated successfully.', 'settings' => $settings]);
    }
}
