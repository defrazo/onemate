<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
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
    }
}
