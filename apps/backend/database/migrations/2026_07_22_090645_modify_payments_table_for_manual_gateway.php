<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Make razorpay fields nullable since we use manual payment now
            $table->string('razorpay_order_id')->nullable()->change();
            $table->string('razorpay_payment_id')->nullable()->change();
            $table->string('razorpay_signature')->nullable()->change();
            
            // Add manual payment fields
            $table->string('utr_number')->nullable()->after('razorpay_signature');
            $table->enum('payment_method', ['razorpay', 'upi', 'bank_transfer'])->default('razorpay')->after('utr_number');
            $table->foreignId('verified_by_admin_id')->nullable()->constrained('users')->nullOnDelete()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['verified_by_admin_id']);
            $table->dropColumn(['utr_number', 'payment_method', 'verified_by_admin_id']);
        });
    }
};
