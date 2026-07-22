<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('roll_number');
            $table->foreignId('mentor_id')->nullable()->constrained('mentor_ids')->onDelete('set null');
            $table->integer('year');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->text('question');
            $table->text('reply')->nullable();
            $table->foreignId('replied_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'replied'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('remarks');
    }
};
