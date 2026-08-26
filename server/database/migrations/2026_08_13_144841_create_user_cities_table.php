<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_cities', function (Blueprint $table) {
            $table->uuid('user_id')->primary();

            $table->string('name');
            $table->string('region')->nullable();
            $table->string('country');

            $table->double('lat');
            $table->double('lon');

            $table->timestampsTz();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_cities');
    }
};