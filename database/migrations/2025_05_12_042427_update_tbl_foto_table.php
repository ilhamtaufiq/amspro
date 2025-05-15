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
        Schema::table('tbl_foto', function (Blueprint $table) {
            $table->dropColumn('komponen');
            $table->unsignedBigInteger('komponen_id')->after('pekerjaan_id');
            $table->unsignedBigInteger('penerima_id')->nullable()->after('komponen_id');
            $table->enum('keterangan', ['0%', '50%', '100%'])->change();
            $table->foreign('komponen_id')->references('id')->on('tbl_output')->onDelete('cascade');
            $table->foreign('penerima_id')->references('id')->on('tbl_penerima')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_foto', function (Blueprint $table) {
            $table->string('komponen')->after('pekerjaan_id');
            $table->dropForeign(['komponen_id']);
            $table->dropForeign(['penerima_id']);
            $table->dropColumn(['komponen_id', 'penerima_id']);
            $table->string('keterangan')->change();
        });
    }
};
