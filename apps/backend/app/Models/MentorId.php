<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MentorId extends Model
{
    use HasFactory;

    protected $fillable = ['staff_id', 'mentor_code', 'department_id'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function students()
    {
        return $this->hasMany(User::class, 'mentor_id');
    }
}
