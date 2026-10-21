<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('monitored_services', function (Blueprint $table) {
            $table->string('type', 20)
                ->default('http')
                ->after('user_id');

            $table->string('host', 253)
                ->nullable()
                ->after('url');

            $table->unsignedSmallInteger('port')
                ->nullable()
                ->after('host');

            $table->string('url', 2048)
                ->nullable()
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('monitored_services', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'host',
                'port',
            ]);
        });
    }
};
