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
        $admin = User::create([
            'name' => 'Sathan (System Administrator)',
            'email' => 'sathandhurkes@gmail.com',
            'password' => Hash::make('Sathanu@061766'),
            'role' => 'ADMIN',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 4. Staff Mentor Account
        $mentorUser = User::create([
            'name' => 'Prof. Smith (CSE Department)',
            'email' => 'prof.smith@mcet.in',
            'password' => Hash::make('password123'),
            'role' => 'STAFF',
            'mentor_id' => 1,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 5. Initial Sample Courses
        $c1 = \App\Models\Course::create([
            'department_id' => $cse->id,
            'title' => 'Cyber Security Fundamentals',
            'slug' => 'cyber-security-fundamentals',
            'description' => 'Comprehensive introduction to cybersecurity principles, cryptography, network security, and vulnerability management.',
            'price' => 499,
            'status' => 'published',
            'created_by' => $admin->id,
        ]);

        \App\Models\Lesson::create([
            'course_id' => $c1->id,
            'title' => 'Introduction to Network Defense',
            'content' => 'Learn the basics of firewalls, IDS/IPS systems, and secure network architecture.',
            'position' => 1,
            'has_quiz' => false,
        ]);

        $c2 = \App\Models\Course::create([
            'department_id' => $cse->id,
            'title' => 'Ethical Hacking & Web Penetration Testing',
            'slug' => 'ethical-hacking-web-pentesting',
            'description' => 'Hands-on guide to OWASP Top 10 vulnerabilities, SQL injection, XSS, and security auditing.',
            'price' => 999,
            'status' => 'published',
            'created_by' => $admin->id,
        ]);

        \App\Models\Lesson::create([
            'course_id' => $c2->id,
            'title' => 'OWASP Top 10 Security Risks',
            'content' => 'Understanding modern web application security risks and countermeasures.',
            'position' => 1,
            'has_quiz' => false,
        ]);

        // 6. Platform Settings
        \App\Models\PlatformSetting::create([
            'id' => 1,
            'upi_id' => 'sathancreator@gmail.com',
            'bank_details' => "Bank: State Bank of India\nAccount: 40982341029\nIFSC: SBIN0001842\nName: MCET Academic CMS",
        ]);
    }
}
