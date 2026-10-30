<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('todo_canvases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 40);
            $table->timestampsTz();
        });
        Schema::create('todo_lists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('canvas_id')->constrained('todo_canvases')->cascadeOnDelete();
            $table->string('title', 60);
            $table->string('color', 50)->default('slate');
            $table->unsignedTinyInteger('slot')->nullable();
            $table->boolean('is_collapsed')->default(false);
            $table->timestampsTz();
            $table->unique(['canvas_id', 'slot']);
        });
        Schema::create('todo_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('list_id')->constrained('todo_lists')->cascadeOnDelete();
            $table->string('text', 100);
            $table->boolean('is_completed')->default(false);
            $table->unsignedInteger('position');
            $table->timestampsTz();
            $table->index(['list_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('todo_items');
        Schema::dropIfExists('todo_lists');
        Schema::dropIfExists('todo_canvases');
    }
};
