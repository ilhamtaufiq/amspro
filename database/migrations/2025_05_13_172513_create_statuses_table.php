<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tbl_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pekerjaan_id')->constrained('tbl_pekerjaan')->onDelete('cascade');
            $table->boolean('kontrak')->default(false);
            $table->boolean('nphd')->default(false);
            $table->boolean('review')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tbl_status');
    }
};
