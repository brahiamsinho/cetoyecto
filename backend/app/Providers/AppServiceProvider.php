<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontend = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
            return "{$frontend}/forgot-password?token={$token}&email=" . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
