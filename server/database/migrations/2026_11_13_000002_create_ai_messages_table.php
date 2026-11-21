<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('conversation_id')->constrained('ai_conversations')->cascadeOnDelete();
            $table->rawColumn('sequence', 'bigint CONSTRAINT ai_messages_sequence_nonnegative CHECK (sequence >= 0)');
            $table->rawColumn('role', "varchar(20) CONSTRAINT ai_messages_role_valid CHECK (role IN ('user', 'assistant'))");
            $table->text('content');
            $table->uuid('reply_to_message_id')->nullable();
            $table->timestampsTz();

            $table->unique(['conversation_id', 'sequence']);
            $table->unique(['id', 'conversation_id']);
            $table->index(['conversation_id', 'sequence', 'id']);
            $table->index(['reply_to_message_id', 'conversation_id']);
            $table->foreign(['reply_to_message_id', 'conversation_id'], 'ai_messages_reply_same_conversation_fk')
                ->references(['id', 'conversation_id'])->on('ai_messages');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_messages');
    }
};
