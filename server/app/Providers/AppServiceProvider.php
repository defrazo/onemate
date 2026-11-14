<?php

namespace App\Providers;

use App\AI\AiException;
use App\AI\AiProvider;
use App\AI\Providers\GroqProvider;
use App\Http\Middleware\EnsureNotDemo;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        Passport::loadKeysFrom(storage_path('passport'));

        Passport::tokensCan([
            'profile:read' => 'Просмотр основных данных аккаунта OneMate',
        ]);

        Passport::authorizationView(function (array $parameters) {
            return redirect()->away(
                rtrim(config('app.frontend_url'), '/') . '/auth/authorize',
            );
        });

        $this->app->booted(function () {
            Route::getRoutes()
                ->getByName('passport.authorizations.approve')
                ?->middleware(EnsureNotDemo::class);
        });
    }

    public function register(): void
    {
        $this->app->bind(AiProvider::class, function () {
            if (config('ai.provider') !== 'groq') {
                throw new AiException('unavailable');
            }

            return new GroqProvider;
        });
    }
}
