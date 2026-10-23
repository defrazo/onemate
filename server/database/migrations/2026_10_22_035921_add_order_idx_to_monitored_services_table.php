<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('monitored_services', function (Blueprint $table) {
            $table->unsignedInteger('order_idx')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('monitored_services', function (Blueprint $table) {
            $table->dropColumn('order_idx');
        });
    }
};
