<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('password_reset_otps')) {
            Schema::table('password_reset_otps', function (Blueprint $table) {
                if (!Schema::hasColumn('password_reset_otps', 'payload')) {
                    $table->text('payload')->nullable()->after('otp_code');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('password_reset_otps')) {
            Schema::table('password_reset_otps', function (Blueprint $table) {
                if (Schema::hasColumn('password_reset_otps', 'payload')) {
                    $table->dropColumn('payload');
                }
            });
        }
    }
};
