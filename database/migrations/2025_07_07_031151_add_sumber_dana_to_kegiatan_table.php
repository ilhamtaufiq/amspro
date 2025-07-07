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
        Schema::table('tbl_kegiatan', function (Blueprint $table) {
            $table->string('sumber_dana')->nullable()->after('tahun_anggaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_kegiatan', function (Blueprint $table) {
            $table->dropColumn('sumber_dana');
        });
    }
};
