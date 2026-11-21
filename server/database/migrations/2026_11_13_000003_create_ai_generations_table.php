<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_generations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('conversation_id');
            $table->uuid('user_message_id');
            $table->uuid('response_message_id')->nullable();
            $table->uuid('request_id');
            $table->char('fingerprint', 64);
            $table->rawColumn('mode', "varchar(20) CONSTRAINT ai_generations_mode_valid CHECK (mode IN ('ask', 'explain', 'improve', 'translate', 'ideas'))");
            $table->string('provider', 50);
            $table->string('model');
            $table->string('actual_model')->nullable();
            $table->rawColumn('status', "varchar(20) CONSTRAINT ai_generations_status_valid CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled'))")->default('queued');
            $table->string('error_code', 100)->nullable();

            foreach (['input_tokens', 'output_tokens', 'total_tokens', 'duration_ms'] as $field) {
                $table->rawColumn($field, "bigint CONSTRAINT ai_generations_{$field}_nonnegative CHECK ({$field} >= 0)")->nullable();
            }

            $table->timestampTz('queued_at')->useCurrent();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('request_started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->timestampTz('cancelled_at')->nullable();
            $table->timestampTz('execution_deadline_at');
            $table->uuid('execution_id')->nullable();
            $table->timestampTz('execution_finished_at')->nullable();
            $table->timestampsTz();

            $table->unique(['user_id', 'request_id']);
            $table->index(['conversation_id', 'created_at', 'id']);
            $table->index(['user_message_id', 'conversation_id']);
            $table->index(['response_message_id', 'conversation_id']);
            $table->foreign(['conversation_id', 'user_id'], 'ai_generations_conversation_owner_fk')
                ->references(['id', 'user_id'])->on('ai_conversations')->cascadeOnDelete();
            $table->foreign(['user_message_id', 'conversation_id'], 'ai_generations_question_same_conversation_fk')
                ->references(['id', 'conversation_id'])->on('ai_messages')->cascadeOnDelete();
            $table->foreign(['response_message_id', 'conversation_id'], 'ai_generations_response_same_conversation_fk')
                ->references(['id', 'conversation_id'])->on('ai_messages');
        });

        DB::statement("ALTER TABLE ai_generations ADD CONSTRAINT ai_generations_execution_state_valid CHECK (
            (status NOT IN ('queued', 'running') OR execution_finished_at IS NULL)
            AND (status NOT IN ('succeeded', 'failed') OR execution_finished_at IS NOT NULL)
        )");
        DB::statement('CREATE UNIQUE INDEX ai_generations_one_execution_per_user ON ai_generations (user_id) WHERE execution_finished_at IS NULL');
        DB::statement('CREATE INDEX ai_generations_pending_deadline ON ai_generations (execution_deadline_at) WHERE execution_finished_at IS NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_generations');
    }
};
