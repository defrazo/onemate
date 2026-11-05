<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kanban_tasks', function (Blueprint $table) {
            $table->date('overdue_email_queued_date')->nullable();
            $table->date('reminder_email_queued_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('kanban_tasks', function (Blueprint $table) {
            $table->dropColumn(['overdue_email_queued_date', 'reminder_email_queued_date']);
        });
    }
};
