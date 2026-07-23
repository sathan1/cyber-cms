<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        self::ensureNotionCoursesExist();

        $user = $request->user() ?? auth('sanctum')->user();

        // Published courses are visible to everyone; STAFF/ADMIN can also see pending_approval
        $query = Course::with(['department', 'creator', 'lessons']);

        if (!$user || !in_array($user->role, ['ADMIN', 'STAFF'])) {
            $query->where('status', 'published');
        } else {
            $query->whereIn('status', ['published', 'pending_approval']);
        }

        $courses = $query->get();

        if ($user) {
            $userEnrollments = Enrollment::where('user_id', $user->id)
                ->pluck('progress_pct', 'course_id');

            $courses->transform(function ($course) use ($userEnrollments, $user) {
                $isEnrolled = isset($userEnrollments[$course->id]) 
                    || in_array($user->role, ['ADMIN', 'STAFF']);
                $course->is_enrolled = $isEnrolled;
                $course->progress_pct = $userEnrollments[$course->id] ?? ($isEnrolled ? 100 : 0);
                return $course;
            });
        }

        return response()->json(['courses' => $courses]);
    }

    public function show(Request $request, $slug)
    {
        self::ensureNotionCoursesExist();

        $course = Course::with(['department', 'creator', 'lessons.quiz', 'assignments'])
            ->where('slug', $slug)
            ->firstOrFail();

        $user = $request->user() ?? auth('sanctum')->user();
        $isEnrolled = false;
        $progressPct = 0;
        $completedLessonIds = [];
        $quizAttemptMap = [];

        if ($user) {
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if ($enrollment) {
                $isEnrolled = true;
                $progressPct = (float) $enrollment->progress_pct;
            } else if (in_array($user->role, ['ADMIN', 'STAFF'])) {
                $isEnrolled = true;
            }

            $completedLessonIds = LessonProgress::where('user_id', $user->id)
                ->whereIn('lesson_id', $course->lessons->pluck('id'))
                ->pluck('lesson_id')
                ->toArray();

            // Build attempt map per quiz for this user
            $quizIds = $course->lessons->pluck('quiz.id')->filter()->values();
            $attempts = QuizAttempt::where('user_id', $user->id)
                ->whereIn('quiz_id', $quizIds)
                ->get()
                ->groupBy('quiz_id');

            foreach ($attempts as $quizId => $quizAttempts) {
                $quizAttemptMap[$quizId] = [
                    'total_attempts' => $quizAttempts->count(),
                    'passed' => $quizAttempts->where('passed', true)->count() > 0,
                    'best_score' => $quizAttempts->max('score_pct'),
                ];
            }
        }

        $canAccess = $isEnrolled || $course->price == 0;

        return response()->json([
            'course' => $course,
            'is_enrolled' => $canAccess,
            'progress_pct' => $progressPct,
            'completed_lesson_ids' => $completedLessonIds,
            'quiz_attempt_map' => $quizAttemptMap,
        ]);
    }

    public function enrollFree(Request $request, $slug)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated. Please log in first.'], 401);
        }

        $course = Course::with(['department', 'creator', 'lessons.quiz', 'assignments'])
            ->where('slug', $slug)
            ->firstOrFail();

        $enrollment = Enrollment::firstOrCreate(
            ['user_id' => $user->id, 'course_id' => $course->id],
            ['progress_pct' => 0]
        );

        // Auto-assign mentor for this course to the student if student doesn't have one
        if ($user->role === 'STUDENT' && !$user->mentor_id) {
            $courseMentor = \App\Models\MentorId::where('department_id', $course->department_id)->first()
                ?? \App\Models\MentorId::first();
            if ($courseMentor) {
                $user->update(['mentor_id' => $courseMentor->id]);
            }
        }

        return response()->json([
            'message' => 'Successfully enrolled in ' . $course->title,
            'is_enrolled' => true,
            'course' => $course,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user || !in_array($user->role, ['ADMIN', 'STAFF'])) {
            return response()->json(['message' => 'Unauthorized. Only Staff or Admin can create courses.'], 403);
        }

        $request->validate([
            'department_id' => 'required|exists:departments,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
        ]);

        $slug = Str::slug($request->title) . '-' . Str::random(5);

        $course = Course::create([
            'department_id' => $request->department_id,
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'price' => $request->price,
            'status' => 'published',
            'created_by' => $user->id,
        ]);

        return response()->json(['message' => 'Course created successfully', 'course' => $course], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user || !in_array($user->role, ['ADMIN', 'STAFF'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $course = Course::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:draft,published,archived',
        ]);

        $course->update($request->only(['title', 'description', 'price', 'status']));

        return response()->json(['message' => 'Course updated successfully', 'course' => $course]);
    }

    public function markLessonComplete(Request $request, $lessonId)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $lesson = Lesson::with('course.lessons')->findOrFail($lessonId);

        // If lesson has a quiz, ensure the student has passed it before marking complete
        if ($lesson->has_quiz) {
            $quiz = Quiz::where('lesson_id', $lesson->id)->first();
            if ($quiz) {
                $passed = QuizAttempt::where('user_id', $user->id)
                    ->where('quiz_id', $quiz->id)
                    ->where('passed', true)
                    ->exists();
                if (!$passed) {
                    return response()->json([
                        'message' => 'You must pass this lesson\'s knowledge check before marking it complete.',
                    ], 422);
                }
            }
        }

        LessonProgress::firstOrCreate([
            'user_id' => $user->id,
            'lesson_id' => $lesson->id,
        ], [
            'completed_at' => now(),
        ]);

        $course = $lesson->course;
        $totalLessons = $course->lessons->count();

        $completedLessonIds = LessonProgress::where('user_id', $user->id)
            ->whereIn('lesson_id', $course->lessons->pluck('id'))
            ->pluck('lesson_id')
            ->toArray();

        $completedCount = count($completedLessonIds);
        $pct = $totalLessons > 0 ? round(($completedCount / $totalLessons) * 100, 2) : 0;

        Enrollment::updateOrCreate([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ], [
            'progress_pct' => $pct,
            'completed_at' => $pct >= 100 ? now() : null,
        ]);

        return response()->json([
            'message' => 'Lesson marked as completed. Next module unlocked!',
            'lesson_id' => $lesson->id,
            'course_id' => $course->id,
            'progress_pct' => $pct,
            'completed_lesson_ids' => $completedLessonIds,
        ]);
    }

    public function submitQuiz(Request $request, $quizId)
    {
        $user = $request->user() ?? auth('sanctum')->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $request->validate([
            'answers' => 'required|array',
        ]);

        $quiz = Quiz::with('lesson.course.lessons')->findOrFail($quizId);
        $questions = $quiz->questions_json ?? [];

        $totalQuestions = count($questions);
        if ($totalQuestions === 0) {
            return response()->json(['message' => 'No questions found in this quiz.'], 400);
        }

        // Check attempt count and retry limits
        $pastAttempts = QuizAttempt::where('user_id', $user->id)
            ->where('quiz_id', $quizId)
            ->get();

        $attemptCount = $pastAttempts->count();
        $alreadyPassed = $pastAttempts->where('passed', true)->count() > 0;

        if (!$alreadyPassed && $attemptCount >= $quiz->max_retries) {
            return response()->json([
                'message' => 'Maximum retry limit reached. Contact your mentor to request a reset.',
                'retries_exhausted' => true,
                'max_retries' => $quiz->max_retries,
                'attempt_number' => $attemptCount,
            ], 422);
        }

        // Score the quiz
        $correctCount = 0;
        foreach ($questions as $idx => $q) {
            $userAns = $request->answers[$idx] ?? null;
            if ($userAns !== null && (int) $userAns === (int) $q['correct']) {
                $correctCount++;
            }
        }

        $scorePct = round(($correctCount / $totalQuestions) * 100);
        $passed = $scorePct >= $quiz->pass_score;
        $currentAttemptNumber = $attemptCount + 1;

        // Log attempt
        QuizAttempt::create([
            'quiz_id' => $quizId,
            'user_id' => $user->id,
            'answers_json' => $request->answers,
            'score_pct' => $scorePct,
            'passed' => $passed,
            'attempt_number' => $currentAttemptNumber,
        ]);

        $completedLessonIds = [];
        $progressPct = 0;

        if ($passed) {
            LessonProgress::firstOrCreate([
                'user_id' => $user->id,
                'lesson_id' => $quiz->lesson_id,
            ], ['completed_at' => now()]);

            $course = $quiz->lesson->course;
            $totalLessons = $course->lessons->count();

            $completedLessonIds = LessonProgress::where('user_id', $user->id)
                ->whereIn('lesson_id', $course->lessons->pluck('id'))
                ->pluck('lesson_id')
                ->toArray();

            $progressPct = $totalLessons > 0 ? round((count($completedLessonIds) / $totalLessons) * 100, 2) : 0;

            Enrollment::updateOrCreate([
                'user_id' => $user->id,
                'course_id' => $course->id,
            ], [
                'progress_pct' => $progressPct,
                'completed_at' => $progressPct >= 100 ? now() : null,
            ]);
        }

        $retriesRemaining = max(0, $quiz->max_retries - $currentAttemptNumber);

        return response()->json([
            'score_pct' => $scorePct,
            'passed' => $passed,
            'pass_score' => $quiz->pass_score,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'attempt_number' => $currentAttemptNumber,
            'max_retries' => $quiz->max_retries,
            'retries_remaining' => $passed ? null : $retriesRemaining,
            'retries_exhausted' => !$passed && $retriesRemaining <= 0,
            'progress_pct' => $progressPct,
            'completed_lesson_ids' => $completedLessonIds,
            'message' => $passed
                ? 'Congratulations! You passed. Next module is now unlocked.'
                : ($retriesRemaining > 0
                    ? "Incorrect. You have {$retriesRemaining} retries remaining."
                    : 'No retries remaining. Contact your mentor.'),
        ]);
    }

    private static function ensureNotionCoursesExist()
    {
        try {
            $admin = \App\Models\User::where('role', 'ADMIN')->first();
            $dept = \App\Models\Department::firstOrCreate(['code' => 'CSE'], ['name' => 'Computer Science & Engineering']);
            
            $c1 = \App\Models\Course::updateOrCreate(
                ['slug' => 'cyber-security-fundamentals'],
                [
                    'department_id' => $dept->id,
                    'title' => 'Cyber Security Fundamentals',
                    'description' => 'Comprehensive introduction to cybersecurity principles, cryptography, network security, and vulnerability management as outlined in Notion Module 1.',
                    'price' => 499,
                    'status' => 'published',
                    'created_by' => $admin ? $admin->id : 1,
                ]
            );

            \App\Models\Lesson::updateOrCreate(
                ['course_id' => $c1->id, 'position' => 1],
                [
                    'title' => 'M1 - Lesson 1.1: Foundations of Cyber Security & Threat Landscapes',
                    'content' => "# Module 1: Foundations of Cyber Security\n\nWelcome to Module 1. In this lesson, we cover the core pillars of cybersecurity, threat modeling, and modern attack vectors.\n\n### Core Pillars (CIA Triad)\n1. **Confidentiality**: Ensuring data is accessible only to authorized personnel.\n2. **Integrity**: Safeguarding the accuracy and completeness of information.\n3. **Availability**: Ensuring timely and reliable access to data and resources.\n\n```bash\n# Check system listening ports\nnetstat -tuln\n```",
                    'has_quiz' => false,
                ]
            );

            \App\Models\Lesson::updateOrCreate(
                ['course_id' => $c1->id, 'position' => 2],
                [
                    'title' => 'M1 - Lesson 1.2: Web Architecture, HTTP/HTTPS Protocol & Sockets',
                    'content' => "# Module 1: Web Architecture & Protocols\n\nUnderstand how modern web applications communicate via HTTP/HTTPS request/response cycles.\n\n### Key Concepts\n- **HTTP Request Methods**: GET, POST, PUT, DELETE, OPTIONS\n- **HTTPS Encryption**: TLS/SSL Handshake & Cipher Suites\n- **Session Management**: JWT vs Cookie-based Sessions\n\n```http\nPOST /api/login HTTP/1.1\nHost: cyber-cms.com\nContent-Type: application/json\n\n{\"email\":\"user@mcet.in\",\"password\":\"secret\"}\n```",
                    'has_quiz' => false,
                ]
            );

            \App\Models\Lesson::updateOrCreate(
                ['course_id' => $c1->id, 'position' => 3],
                [
                    'title' => 'M1 - Lesson 1.3: OWASP Top 10 Web Vulnerabilities & Exploitation',
                    'content' => "# Module 1: OWASP Top 10 Security Risks\n\nAn in-depth analysis of critical web application security risks.\n\n1. **A01: Broken Access Control**: Bypassing authorization checks to access restricted endpoints.\n2. **A02: Cryptographic Failures**: Using weak hash algorithms (MD5/SHA1) or unencrypted transport.\n3. **A03: Injection**: SQLi, Command Injection, and LDAP Injection.\n\n### Vulnerable SQL Code Example\n```sql\nSELECT * FROM users WHERE email = '\" . \$user_email . \"' AND password = '\" . \$user_password . \"';\n```",
                    'has_quiz' => false,
                ]
            );

            $l4 = \App\Models\Lesson::updateOrCreate(
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

            \App\Models\Quiz::updateOrCreate(
                ['lesson_id' => $l4->id],
                [
                    'title' => 'Module 1 Knowledge Check: Traffic Interception & REST Security',
                    'questions_json' => [
                        [
                            'question' => 'Which HTTP header is used to convey authentication bearer tokens in REST APIs?',
                            'options' => [
                                'Authorization: Bearer <token>',
                                'X-API-Key: <token>',
                                'Content-Type: application/jwt',
                                'Host: auth.token'
                            ],
                            'correct' => 0
                        ],
                        [
                            'question' => 'What is the default listening port for Burp Suite HTTP Proxy?',
                            'options' => ['8080', '443', '80', '3306'],
                            'correct' => 0
                        ]
                    ],
                    'pass_score' => 50,
                    'max_retries' => 3
                ]
            );

            $c2 = \App\Models\Course::updateOrCreate(
                ['slug' => 'ethical-hacking-web-pentesting'],
                [
                    'department_id' => $dept->id,
                    'title' => 'Ethical Hacking & Web Penetration Testing',
                    'description' => 'Hands-on guide to OWASP Top 10 vulnerabilities, SQL injection, XSS, and security auditing as outlined in Notion Module 1.',
                    'price' => 999,
                    'status' => 'published',
                    'created_by' => $admin ? $admin->id : 1,
                ]
            );

            \App\Models\Lesson::updateOrCreate(
                ['course_id' => $c2->id, 'position' => 1],
                [
                    'title' => 'M1 - Lesson 1.1: Web Pentesting Reconnaissance & Subdomain Enumeration',
                    'content' => "# Module 1: Reconnaissance & Footprinting\n\nGathering intelligence on target web applications using passive and active reconnaissance.\n\n### Tools & Techniques\n- `subfinder -d target.com`\n- `nmap -sV -sC -p 80,443 target.com`\n- Google Dorking for exposed admin panels",
                    'has_quiz' => false,
                ]
            );

            $l2_2 = \App\Models\Lesson::updateOrCreate(
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

            \App\Models\Quiz::updateOrCreate(
                ['lesson_id' => $l2_2->id],
                [
                    'title' => 'Module 1 Knowledge Check: Web Pentesting & SQL Injection',
                    'questions_json' => [
                        [
                            'question' => 'What tool is widely used for automated SQL injection testing?',
                            'options' => ['sqlmap', 'Wireshark', 'Metasploit', 'John the Ripper'],
                            'correct' => 0
                        ]
                    ],
                    'pass_score' => 50,
                    'max_retries' => 3
                ]
            );

            // Course 3: Introduction to Computer Networks (from Notion Module 1)
            $networkCourse = \App\Data\NetworksCourseData::getCourse();
            $c3 = \App\Models\Course::updateOrCreate(
                ['slug' => $networkCourse['slug']],
                array_merge($networkCourse, [
                    'department_id' => $dept->id,
                    'created_by' => $admin ? $admin->id : 1,
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
                $l = \App\Models\Lesson::updateOrCreate(
                    ['course_id' => $c3->id, 'position' => $pos],
                    $lessonData
                );
                if ($l->has_quiz) {
                    $quizLesson3 = $l;
                }
            }

            if ($quizLesson3) {
                \App\Models\Quiz::updateOrCreate(
                    ['lesson_id' => $quizLesson3->id],
                    \App\Data\NetworksCourseData::getQuiz()
                );
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Course auto-provision error: " . $e->getMessage());
        }
    }
}
