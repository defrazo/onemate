<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_provider_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('generation_id')->nullable()->constrained('ai_generations')->nullOnDelete();
            $table->string('provider', 50);
            $table->string('model');
            $table->timestampTz('started_at', 6);
            $table->timestampTz('finished_at', 6)->nullable();
            $table->timestampTz('observed_at', 6)->nullable();
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->string('state', 20)->default('unknown');
            $table->unsignedBigInteger('input_tokens')->nullable();
            $table->unsignedBigInteger('output_tokens')->nullable();
            $table->unsignedBigInteger('total_tokens')->nullable();
            $table->json('rate_limits')->nullable();
            $table->index(['provider', 'model', 'started_at']);
            $table->index(['provider', 'model', 'observed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_provider_requests');
    }
};
