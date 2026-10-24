<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE oauth_auth_codes DROP COLUMN user_id');
        DB::statement('ALTER TABLE oauth_auth_codes ADD COLUMN user_id uuid');

        DB::statement('ALTER TABLE oauth_access_tokens DROP COLUMN user_id');
        DB::statement('ALTER TABLE oauth_access_tokens ADD COLUMN user_id uuid');
    }

    public function down(): void
    {
    }
};
