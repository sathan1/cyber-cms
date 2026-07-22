<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\MentorId;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Academic Departments
        $cse = Department::create(['name' => 'Computer Science & Engineering', 'code' => 'CSE']);
        $ece = Department::create(['name' => 'Electronics & Communication', 'code' => 'ECE']);
        $it  = Department::create(['name' => 'Information Technology', 'code' => 'IT']);

        // 2. Official Staff Mentor IDs
        MentorId::create(['staff_id' => 'ST-1001', 'mentor_code' => 'MTR-CSE-101', 'department_id' => $cse->id]);
        MentorId::create(['staff_id' => 'ST-1002', 'mentor_code' => 'MTR-CSE-102', 'department_id' => $cse->id]);
        MentorId::create(['staff_id' => 'ST-2001', 'mentor_code' => 'MTR-ECE-201', 'department_id' => $ece->id]);

        // 3. System Administrator Account
        User::create([
            'name' => 'Sathan (System Administrator)',
            'email' => 'sathandhurkes@gmail.com',
            'password' => Hash::make('Sathanu@061766'),
            'role' => 'ADMIN',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
    }
}
