<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tbl_penerima', function (Blueprint $table) {
            $table->string('nik')->nullable()->change();
            $table->string('alamat')->nullable()->change();
            $table->integer('jumlah_jiwa')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_penerima', function (Blueprint $table) {
            $table->string('nik')->nullable(false)->change();
            $table->string('alamat')->nullable(false)->change();
            $table->integer('jumlah_jiwa')->nullable(false)->change();
        });
    }
};