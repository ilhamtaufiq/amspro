<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pekerjaan_id')->constrained('tbl_pekerjaan')->onDelete('cascade');
            $table->foreignId('komponen_id')->constrained('tbl_output')->onDelete('cascade');
            $table->decimal('realisasi_fisik', 10, 2); // Renamed from rencana_volume
            $table->decimal('realisasi_keuangan', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_progress');
    }
};