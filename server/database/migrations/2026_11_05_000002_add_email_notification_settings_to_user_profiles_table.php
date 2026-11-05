<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->boolean('network_email_notifications_enabled')->default(false);
            $table->boolean('kanban_email_notifications_enabled')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn(['network_email_notifications_enabled', 'kanban_email_notifications_enabled']);
        });
    }
};
