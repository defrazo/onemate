<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_generations', function (Blueprint $table) {
            $table->boolean('search_enabled')->default(false);
            $table->boolean('search_executed')->nullable();
            $table->jsonb('sources')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('ai_generations', fn (Blueprint $table) => $table->dropColumn(['search_enabled', 'search_executed', 'sources']));
    }
};
