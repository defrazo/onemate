<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_provider_requests', function (Blueprint $table) {
            $table->jsonb('response_diagnostics')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('ai_provider_requests', function (Blueprint $table) {
            $table->dropColumn('response_diagnostics');
        });
    }
};
