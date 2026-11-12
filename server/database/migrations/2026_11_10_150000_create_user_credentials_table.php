<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('credentials_revision')->default(0);
        });
        Schema::create('user_credentials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('service', 100);
            $table->string('login', 255)->default('');
            $table->text('password')->nullable();
            $table->text('comment')->nullable();
            $table->string('url', 2048)->nullable();
            $table->string('color', 20)->default('sky');
            $table->unsignedInteger('order_idx')->default(0);
            $table->timestampsTz();
            $table->index(['user_id', 'order_idx', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_credentials');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('credentials_revision'));
    }
};
