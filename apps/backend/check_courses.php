<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

foreach (App\Models\Course::with('lessons')->get() as $course) {
    echo "Course ID: " . $course->id . " | Title: " . $course->title . "\n";
    foreach ($course->lessons as $lesson) {
        echo "  - Lesson ID: " . $lesson->id . " | Title: " . $lesson->title . "\n";
    }
}
