<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kanban_tasks', function (Blueprint $table) {
            $table->string('status')->nullable()->default('active')->change();
            $table->string('priority')->nullable()->default('medium')->change();
            $table->date('start_date')->nullable()->defaultRaw('CURRENT_DATE')->change();
        });
    }

    public function down(): void
    {
        Schema::table('kanban_tasks', function (Blueprint $table) {
            $table->string('status')->nullable(false)->default('active')->change();
            $table->string('priority')->nullable(false)->default('medium')->change();
            $table->date('start_date')->nullable(false)->defaultRaw('CURRENT_DATE')->change();
        });
    }
};
