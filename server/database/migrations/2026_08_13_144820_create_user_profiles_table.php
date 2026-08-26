<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->uuid('user_id')->primary();

            $table->text('avatar_url')->nullable();
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('location')->nullable();
            $table->jsonb('phones')->nullable();
            $table->jsonb('additional_emails')->nullable();

            $table->string('theme')->default('dark');
            $table->jsonb('widgets_sequence')->nullable();
            $table->jsonb('widgets_slots')->nullable();

            $table->timestampTz('password_changed_at')->nullable();

            $table->timestampsTz();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
