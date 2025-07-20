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
            $table->boolean('validasi_koordinat')->default(false);
            $table->string('validasi_koordinat_message')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_foto', function (Blueprint $table) {
            $table->dropColumn(['validasi_koordinat', 'validasi_koordinat_message']);
        });
    }
};
