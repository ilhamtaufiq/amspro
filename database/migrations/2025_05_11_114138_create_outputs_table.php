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
        Schema::create('tbl_output', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pekerjaan_id')->constrained('tbl_pekerjaan')->onDelete('cascade');
            $table->string('komponen');
            $table->string('satuan');
            $table->decimal('volume', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_output');
    }
};
