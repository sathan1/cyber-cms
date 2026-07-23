<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\MentorId;
use App\Models\User;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\PlatformSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Academic Departments
        $cse = Department::firstOrCreate(['code' => 'CSE'], ['name' => 'Computer Science & Engineering']);
        $ece = Department::firstOrCreate(['code' => 'ECE'], ['name' => 'Electronics & Communication']);
        $it  = Department::firstOrCreate(['code' => 'IT'],  ['name' => 'Information Technology']);

        // 2. Official Staff Mentor IDs & Codes
        $m1 = MentorId::firstOrCreate(['mentor_code' => 'MTR-CSE-101'], ['staff_id' => 'ST-1001', 'department_id' => $cse->id]);
        $m2 = MentorId::firstOrCreate(['mentor_code' => 'MTR-ECE-201'], ['staff_id' => 'ST-2001', 'department_id' => $ece->id]);
        $m3 = MentorId::firstOrCreate(['mentor_code' => 'MTR-IT-301'],  ['staff_id' => 'ST-3001', 'department_id' => $it->id]);
        $m4 = MentorId::firstOrCreate(['mentor_code' => 'MTR-CSE-102'], ['staff_id' => 'ST-1002', 'department_id' => $cse->id]);

        // 3. System Administrator Account
        $admin = User::firstOrCreate(
            ['email' => 'sathandhurkes@gmail.com'],
            [
                'name' => 'Sathan (System Administrator)',
                'password' => Hash::make('Sathanu@061766'),
                'role' => 'ADMIN',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // 4. 4 Official Staff Mentor Accounts
        User::firstOrCreate(
            ['email' => 'sathish.cse@mcet.in'],
            [
                'name' => 'Prof. Sathish Kumar (CSE)',
                'password' => Hash::make('password123'),
                'role' => 'STAFF',
                'mentor_id' => $m1->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'anitha.ece@mcet.in'],
            [
                'name' => 'Dr. Anitha Ramesh (ECE)',
                'password' => Hash::make('password123'),
                'role' => 'STAFF',
                'mentor_id' => $m2->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'vignesh.it@mcet.in'],
            [
                'name' => 'Prof. Vigneshwaran (IT)',
                'password' => Hash::make('password123'),
                'role' => 'STAFF',
                'mentor_id' => $m3->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'rajesh.cse@mcet.in'],
            [
                'name' => 'Prof. Rajesh Kannan (CSE)',
                'password' => Hash::make('password123'),
                'role' => 'STAFF',
                'mentor_id' => $m4->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // 5. Initial Sample Courses with Module 1 Notion Curriculum
        $c1 = Course::firstOrCreate(
            ['slug' => 'cyber-security-fundamentals'],
            [
                'department_id' => $cse->id,
                'title' => 'Cyber Security Fundamentals',
                'description' => 'Comprehensive introduction to cybersecurity principles, cryptography, network security, and vulnerability management.',
                'price' => 499,
                'status' => 'published',
                'created_by' => $admin->id,
            ]
        );

        Lesson::firstOrCreate(
            ['course_id' => $c1->id, 'position' => 1],
            [
                'title' => 'M1 - Lesson 1.1: Foundations of Cyber Security & Threat Landscapes',
                'content' => "# Module 1: Foundations of Cyber Security\n\nWelcome to Module 1. In this lesson, we cover the core pillars of cybersecurity, threat modeling, and modern attack vectors.\n\n### Core Pillars (CIA Triad)\n1. **Confidentiality**: Ensuring data is accessible only to authorized personnel.\n2. **Integrity**: Safeguarding the accuracy and completeness of information.\n3. **Availability**: Ensuring timely and reliable access to data and resources.\n\n```bash\n# Check system listening ports\nnetstat -tuln\n```",
                'has_quiz' => false,
            ]
        );

        Lesson::firstOrCreate(
            ['course_id' => $c1->id, 'position' => 2],
            [
                'title' => 'M1 - Lesson 1.2: Web Architecture, HTTP/HTTPS Protocol & Sockets',
                'content' => "# Module 1: Web Architecture & Protocols\n\nUnderstand how modern web applications communicate via HTTP/HTTPS request/response cycles.\n\n### Key Concepts\n- **HTTP Request Methods**: GET, POST, PUT, DELETE, OPTIONS\n- **HTTPS Encryption**: TLS/SSL Handshake & Cipher Suites\n- **Session Management**: JWT vs Cookie-based Sessions\n\n```http\nPOST /api/login HTTP/1.1\nHost: cyber-cms.com\nContent-Type: application/json\n\n{\"email\":\"user@mcet.in\",\"password\":\"secret\"}\n```",
                'has_quiz' => false,
            ]
        );

        Lesson::firstOrCreate(
            ['course_id' => $c1->id, 'position' => 3],
            [
                'title' => 'M1 - Lesson 1.3: OWASP Top 10 Web Vulnerabilities & Exploitation',
                'content' => "# Module 1: OWASP Top 10 Security Risks\n\nAn in-depth analysis of critical web application security risks.\n\n1. **A01: Broken Access Control**: Bypassing authorization checks to access restricted endpoints.\n2. **A02: Cryptographic Failures**: Using weak hash algorithms (MD5/SHA1) or unencrypted transport.\n3. **A03: Injection**: SQLi, Command Injection, and LDAP Injection.\n\n### Vulnerable SQL Code Example\n```sql\nSELECT * FROM users WHERE email = '\" . \$user_email . \"' AND password = '\" . \$user_password . \"';\n```",
                'has_quiz' => false,
            ]
        );

        Lesson::firstOrCreate(
            ['course_id' => $c1->id, 'position' => 4],
            [
                'title' => 'M1 - Lesson 1.4: Hands-on Lab: Traffic Interception with Burp Suite',
                'content' => "# Module 1 Lab: Intercepting Traffic\n\nIn this practical lab, you will configure Burp Suite Proxy to intercept, inspect, and modify HTTP requests in real time.\n\n### Lab Objectives\n- Configure browser proxy settings to `127.0.0.1:8080`\n- Install Burp Suite CA Certificate in Trusted Root Authorities\n- Intercept POST requests and modify parameter payloads before forwarding.",
                'has_quiz' => true,
                'quiz_question' => 'Which HTTP header is used to convey authentication bearer tokens in REST APIs?',
                'quiz_option_a' => 'Authorization: Bearer <token>',
                'quiz_option_b' => 'X-API-Key: <token>',
                'quiz_option_c' => 'Content-Type: application/jwt',
                'quiz_option_d' => 'Host: auth.token',
                'quiz_correct_option' => 'A',
            ]
        );

        $c2 = Course::firstOrCreate(
            ['slug' => 'ethical-hacking-web-pentesting'],
            [
                'department_id' => $cse->id,
                'title' => 'Ethical Hacking & Web Penetration Testing',
                'description' => 'Hands-on guide to OWASP Top 10 vulnerabilities, SQL injection, XSS, and security auditing.',
                'price' => 999,
                'status' => 'published',
                'created_by' => $admin->id,
            ]
        );

        Lesson::firstOrCreate(
            ['course_id' => $c2->id, 'position' => 1],
            [
                'title' => 'M1 - Lesson 1.1: Web Pentesting Reconnaissance & Subdomain Enumeration',
                'content' => "# Module 1: Reconnaissance & Footprinting\n\nGathering intelligence on target web applications using passive and active reconnaissance.\n\n### Tools & Techniques\n- `subfinder -d target.com`\n- `nmap -sV -sC -p 80,443 target.com`\n- Google Dorking for exposed admin panels",
                'has_quiz' => false,
            ]
        );

        Lesson::firstOrCreate(
            ['course_id' => $c2->id, 'position' => 2],
            [
                'title' => 'M1 - Lesson 1.2: Exploiting SQL Injection & Command Injection',
                'content' => "# Module 1: Injection Vulnerabilities\n\nDeep dive into manual and automated SQL injection techniques using `sqlmap`.\n\n```bash\nsqlmap -u \"https://target.com/item?id=1\" --dbs --batch\n```",
                'has_quiz' => true,
                'quiz_question' => 'What tool is widely used for automated SQL injection testing?',
                'quiz_option_a' => 'sqlmap',
                'quiz_option_b' => 'Wireshark',
                'quiz_option_c' => 'Metasploit',
                'quiz_option_d' => 'John the Ripper',
                'quiz_correct_option' => 'A',
            ]
        );

        // 5b. Introduction to Computer Networks (Notion Module 1)
        $networkCourse = \App\Data\NetworksCourseData::getCourse();
        $c3 = Course::firstOrCreate(
            ['slug' => $networkCourse['slug']],
            array_merge($networkCourse, [
                'department_id' => $cse->id,
                'created_by' => $admin->id,
            ])
        );

        $quizLesson3 = null;
        foreach (\App\Data\NetworksCourseData::getLessons() as $lessonData) {
            $pos = $lessonData['position'];
            unset(
                $lessonData['position'],
                $lessonData['quiz_question'],
                $lessonData['quiz_option_a'],
                $lessonData['quiz_option_b'],
                $lessonData['quiz_option_c'],
                $lessonData['quiz_option_d'],
                $lessonData['quiz_correct_option']
            );
            $l = Lesson::firstOrCreate(
                ['course_id' => $c3->id, 'position' => $pos],
                $lessonData
            );
            if ($l->has_quiz) {
                $quizLesson3 = $l;
            }
        }

        if ($quizLesson3) {
            \App\Models\Quiz::firstOrCreate(
                ['lesson_id' => $quizLesson3->id],
                \App\Data\NetworksCourseData::getQuiz()
            );
        }

        // 6. Platform Settings
        PlatformSetting::firstOrCreate(
            ['id' => 1],
            [
                'upi_id' => 'sathancreator@gmail.com',
                'bank_details' => "Bank: State Bank of India\nAccount: 40982341029\nIFSC: SBIN0001842\nName: CyberCMS Academic Platform",
            ]
        );
    }
}
