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
        // 1. Departments
        $cse = Department::create(['name' => 'Computer Science & Engineering', 'code' => 'CSE']);
        $ece = Department::create(['name' => 'Electronics & Communication', 'code' => 'ECE']);
        $it  = Department::create(['name' => 'Information Technology', 'code' => 'IT']);

        // 2. Mentor IDs / Staff Codes
        $mentor1 = MentorId::create(['staff_id' => 'ST-1001', 'mentor_code' => 'MTR-CSE-101', 'department_id' => $cse->id]);
        $mentor2 = MentorId::create(['staff_id' => 'ST-1002', 'mentor_code' => 'MTR-CSE-102', 'department_id' => $cse->id]);
        $mentor3 = MentorId::create(['staff_id' => 'ST-2001', 'mentor_code' => 'MTR-ECE-201', 'department_id' => $ece->id]);

        // 3. Admin Accounts
        User::create([
            'name' => 'System Administrator',
            'email' => 'admin@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'ADMIN',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Dr. Margaret Hamilton (Dean)',
            'email' => 'dean.academic@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'ADMIN',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 4. Staff / Mentor Accounts
        User::create([
            'name' => 'Dr. Robert Smith',
            'email' => 'prof.smith@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'STAFF',
            'mentor_id' => $mentor1->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Dr. Sarah Connor',
            'email' => 'dr.sarah@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'STAFF',
            'mentor_id' => $mentor2->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Prof. Alan Turing',
            'email' => 'prof.alan@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'STAFF',
            'mentor_id' => $mentor3->id,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 5. Student Accounts (Various Cohort Years 1–4)
        User::create([
            'name' => 'Alice Johnson',
            'email' => 'student@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'STUDENT',
            'mentor_id' => $mentor1->id,
            'year' => 3,
            'roll_number' => 'CSE2026-042',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Bob Williams',
            'email' => 'bob@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'STUDENT',
            'mentor_id' => $mentor1->id,
            'year' => 3,
            'roll_number' => 'CSE2026-089',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'David Miller',
            'email' => 'david.y1@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'STUDENT',
            'mentor_id' => $mentor1->id,
            'year' => 1,
            'roll_number' => 'CSE2028-012',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Emma Davis',
            'email' => 'emma.y2@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'STUDENT',
            'mentor_id' => $mentor3->id,
            'year' => 2,
            'roll_number' => 'ECE2027-055',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Frank Wilson',
            'email' => 'frank.y4@institution.edu',
            'password' => Hash::make('password123'),
            'role' => 'STUDENT',
            'mentor_id' => $mentor2->id,
            'year' => 4,
            'roll_number' => 'IT2025-007',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 6. Paid External Users
        User::create([
            'name' => 'Charlie Brown',
            'email' => 'charlie@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'PAID_USER',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Grace Hopper',
            'email' => 'grace.hopper@yahoo.com',
            'password' => Hash::make('password123'),
            'role' => 'PAID_USER',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Linus Torvalds',
            'email' => 'linus.torvalds@outlook.com',
            'password' => Hash::make('password123'),
            'role' => 'PAID_USER',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Courses, lessons, quizzes, and assignments are created
        // by Staff via the CMS Portal at /dashboard/staff/cms
    }
}
