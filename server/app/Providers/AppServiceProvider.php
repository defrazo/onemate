<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
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

        Passport::tokensCan([
            'profile:read' => 'Просмотр основных данных аккаунта OneMate',
        ]);

        Passport::authorizationView(function (array $parameters) {
            return redirect()->away(
                rtrim(config('app.frontend_url'), '/') . '/auth/authorize',
            );
        });
    }
}
