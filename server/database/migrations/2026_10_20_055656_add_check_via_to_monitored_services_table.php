<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('monitored_services', function (Blueprint $table) {
            $table->string('check_via', 10)->default('direct');
        });
    }

    public function down(): void
    {
        Schema::table('monitored_services', function (Blueprint $table) {
            $table->dropColumn('check_via');
        });
    }
};
