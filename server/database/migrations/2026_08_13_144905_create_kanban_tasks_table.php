<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kanban_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('column_id')->nullable();

            $table->string('title')->default('');
            $table->text('description')->default('');

            $table->date('start_date')->default(DB::raw('CURRENT_DATE'));
            $table->date('end_date')->nullable();
            $table->decimal('position', 12, 4)->default(0);
            $table->string('status')->default('active');
            $table->string('priority')->default('medium');
            $table->boolean('completed')->default(false);

            $table->timestampsTz();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('column_id')
                ->references('id')
                ->on('kanban_columns')
                ->cascadeOnDelete();

            $table->index(['user_id', 'column_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kanban_tasks');
    }
};
