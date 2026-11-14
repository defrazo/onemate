<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->timestampTz('archived_at')->nullable();
            $table->timestampTz('pinned_at')->nullable();
            $table->timestampTz('last_activity_at');
            $table->timestampsTz();

            $table->unique(['id', 'user_id']);
            $table->index(['user_id', 'last_activity_at', 'id']);
        });

        DB::statement('CREATE UNIQUE INDEX ai_conversations_one_active_per_user ON ai_conversations (user_id) WHERE archived_at IS NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_conversations');
    }
};
