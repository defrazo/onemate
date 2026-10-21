<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitored_services', function (Blueprint $table) {
            $table->id();

            $table->foreignUuid('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name', 100);
            $table->string('url', 2048);
            $table->boolean('is_active')->default(true);

            $table->string('last_status', 20)->nullable();
            $table->unsignedSmallInteger('last_status_code')->nullable();
            $table->unsignedInteger('last_response_time')->nullable();
            $table->timestamp('last_checked_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitored_services');
    }
};
