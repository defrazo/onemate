<?php

namespace Database\Seeders;

use App\Models\User\User;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            [
                'email' => 'demo@example.com',
            ],
            [
                'username' => 'DemoUser',
                'password' => 'DemoPassword123',
                'email_verified_at' => now(),
                'privacy_accepted_at' => now(),
                'role' => 'demo',
            ],
        );

        $user->profile()->firstOrCreate();
    }
}
