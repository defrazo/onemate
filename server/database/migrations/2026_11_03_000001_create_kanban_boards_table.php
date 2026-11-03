<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kanban_boards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('owner_id');
            $table->string('title', 30);
            $table->rawColumn('revision', 'bigint CONSTRAINT kanban_boards_revision_nonnegative CHECK (revision >= 0)')->default(0);
            $table->timestampsTz();

            $table->foreign('owner_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->index(['owner_id', 'created_at', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kanban_boards');
    }
};
