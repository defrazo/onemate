<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kanban_columns', function (Blueprint $table) {
            $table->uuid('board_id')->nullable();

            $table->foreign('board_id')
                ->references('id')
                ->on('kanban_boards')
                ->cascadeOnDelete();

            $table->index(['board_id', 'position', 'id']);
        });
    }

    public function down(): void
    {
        Schema::table('kanban_columns', function (Blueprint $table) {
            $table->dropForeign(['board_id']);
            $table->dropIndex(['board_id', 'position', 'id']);
            $table->dropColumn('board_id');
        });
    }
};
