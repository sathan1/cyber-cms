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
            'email' => 'prof.smith@cybercms.org',
            'password' => Hash::make('password123'),
            'role' => 'STAFF',
            'mentor_id' => 1,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // 5. Initial Sample Courses with Module 1 Notion Curriculum
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
            'title' => 'M1 - Lesson 1.1: Foundations of Cyber Security & Threat Landscapes',
            'content' => "# Module 1: Foundations of Cyber Security\n\nWelcome to Module 1. In this lesson, we cover the core pillars of cybersecurity, threat modeling, and modern attack vectors.\n\n### Core Pillars (CIA Triad)\n1. **Confidentiality**: Ensuring data is accessible only to authorized personnel.\n2. **Integrity**: Safeguarding the accuracy and completeness of information.\n3. **Availability**: Ensuring timely and reliable access to data and resources.\n\n```bash\n# Check system listening ports\nnetstat -tuln\n```",
            'position' => 1,
            'has_quiz' => false,
        ]);

        \App\Models\Lesson::create([
            'course_id' => $c1->id,
            'title' => 'M1 - Lesson 1.2: Web Architecture, HTTP/HTTPS Protocol & Sockets',
            'content' => "# Module 1: Web Architecture & Protocols\n\nUnderstand how modern web applications communicate via HTTP/HTTPS request/response cycles.\n\n### Key Concepts\n- **HTTP Request Methods**: GET, POST, PUT, DELETE, OPTIONS\n- **HTTPS Encryption**: TLS/SSL Handshake & Cipher Suites\n- **Session Management**: JWT vs Cookie-based Sessions\n\n```http\nPOST /api/login HTTP/1.1\nHost: cyber-cms.com\nContent-Type: application/json\n\n{\"email\":\"user@mcet.in\",\"password\":\"secret\"}\n```",
            'position' => 2,
            'has_quiz' => false,
        ]);

        \App\Models\Lesson::create([
            'course_id' => $c1->id,
            'title' => 'M1 - Lesson 1.3: OWASP Top 10 Web Vulnerabilities & Exploitation',
            'content' => "# Module 1: OWASP Top 10 Security Risks\n\nAn in-depth analysis of critical web application security risks.\n\n1. **A01: Broken Access Control**: Bypassing authorization checks to access restricted endpoints.\n2. **A02: Cryptographic Failures**: Using weak hash algorithms (MD5/SHA1) or unencrypted transport.\n3. **A03: Injection**: SQLi, Command Injection, and LDAP Injection.\n\n### Vulnerable SQL Code Example\n```sql\nSELECT * FROM users WHERE email = '\" . $user_email . \"' AND password = '\" . $user_password . \"';\n```",
            'position' => 3,
            'has_quiz' => false,
        ]);

        \App\Models\Lesson::create([
            'course_id' => $c1->id,
            'title' => 'M1 - Lesson 1.4: Hands-on Lab: Traffic Interception with Burp Suite',
            'content' => "# Module 1 Lab: Intercepting Traffic\n\nIn this practical lab, you will configure Burp Suite Proxy to intercept, inspect, and modify HTTP requests in real time.\n\n### Lab Objectives\n- Configure browser proxy settings to `127.0.0.1:8080`\n- Install Burp Suite CA Certificate in Trusted Root Authorities\n- Intercept POST requests and modify parameter payloads before forwarding.",
            'position' => 4,
            'has_quiz' => true,
            'quiz_question' => 'Which HTTP header is used to convey authentication bearer tokens in REST APIs?',
            'quiz_option_a' => 'Authorization: Bearer <token>',
            'quiz_option_b' => 'X-API-Key: <token>',
            'quiz_option_c' => 'Content-Type: application/jwt',
            'quiz_option_d' => 'Host: auth.token',
            'quiz_correct_option' => 'A',
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
            'title' => 'M1 - Lesson 1.1: Web Pentesting Reconnaissance & Subdomain Enumeration',
            'content' => "# Module 1: Reconnaissance & Footprinting\n\nGathering intelligence on target web applications using passive and active reconnaissance.\n\n### Tools & Techniques\n- `subfinder -d target.com`\n- `nmap -sV -sC -p 80,443 target.com`\n- Google Dorking for exposed admin panels",
            'position' => 1,
            'has_quiz' => false,
        ]);

        \App\Models\Lesson::create([
            'course_id' => $c2->id,
            'title' => 'M1 - Lesson 1.2: Exploiting SQL Injection & Command Injection',
            'content' => "# Module 1: Injection Vulnerabilities\n\nDeep dive into manual and automated SQL injection techniques using `sqlmap`.\n\n```bash\nsqlmap -u \"https://target.com/item?id=1\" --dbs --batch\n```",
            'position' => 2,
            'has_quiz' => true,
            'quiz_question' => 'What tool is widely used for automated SQL injection testing?',
            'quiz_option_a' => 'sqlmap',
            'quiz_option_b' => 'Wireshark',
            'quiz_option_c' => 'Metasploit',
            'quiz_option_d' => 'John the Ripper',
            'quiz_correct_option' => 'A',
        ]);

        // 6. Platform Settings
        \App\Models\PlatformSetting::create([
            'id' => 1,
            'upi_id' => 'sathancreator@gmail.com',
            'bank_details' => "Bank: State Bank of India\nAccount: 40982341029\nIFSC: SBIN0001842\nName: CyberCMS Academic Platform",
        ]);
    }
}
