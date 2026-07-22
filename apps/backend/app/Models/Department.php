<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code'];

    public function mentorIds()
    {
        return $this->hasMany(MentorId::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
