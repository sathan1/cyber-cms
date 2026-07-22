<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Remark extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'roll_number',
        'mentor_id',
        'year',
        'course_id',
        'question',
        'reply',
        'replied_by',
        'status',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function mentor()
    {
        return $this->belongsTo(MentorId::class, 'mentor_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function replier()
    {
        return $this->belongsTo(User::class, 'replied_by');
    }
}
