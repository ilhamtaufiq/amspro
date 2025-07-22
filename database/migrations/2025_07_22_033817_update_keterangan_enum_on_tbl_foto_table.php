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
            $table->enum('keterangan', ['0%', '25%', '50%', '75%', '100%'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_foto', function (Blueprint $table) {
            $table->enum('keterangan', ['0%', '50%', '100%'])->change();
        });
    }
};
