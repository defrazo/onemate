<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('user_cities');

        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn('location');
        });

        Schema::create('user_locations', function (Blueprint $table) {
            $table->id();

            $table->uuid('user_id');

            $table->string('type', 32);

            $table->string('name');
            $table->string('region')->nullable();
            $table->string('country');

            $table->double('lat');
            $table->double('lon');

            $table->timestampsTz();

            $table
                ->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->unique(['user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_locations');

        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('location')->nullable();
        });

        Schema::create('user_cities', function (Blueprint $table) {
            $table->uuid('user_id')->primary();

            $table->string('name');
            $table->string('region')->nullable();
            $table->string('country');

            $table->double('lat');
            $table->double('lon');

            $table->timestampsTz();

            $table
                ->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }
};
