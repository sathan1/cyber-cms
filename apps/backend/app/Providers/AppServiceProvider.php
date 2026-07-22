<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            $dbPath = database_path('database.sqlite');
            if (!file_exists($dbPath)) {
                @touch($dbPath);
                @chmod($dbPath, 0777);
            }
            if (!\Illuminate\Support\Facades\Schema::hasTable('users') || \App\Models\Lesson::count() < 5) {
                \Illuminate\Support\Facades\Artisan::call('migrate:fresh', [
                    '--force' => true,
                    '--seed' => true,
                ]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AppServiceProvider boot error: ' . $e->getMessage());
        }
    }
}
