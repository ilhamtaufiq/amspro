<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->json('kegiatan_id')->nullable()->after('guard_name');
        });
    }

    public function down()
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('kegiatan_id');
        });
    }
}; 