<?php

namespace App\Providers;

use App\Http\Middleware\EnsureNotDemo;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
    }

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
}
