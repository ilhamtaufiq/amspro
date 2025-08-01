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
        // Add indexes for better map performance
        Schema::table('tbl_pekerjaan', function (Blueprint $table) {
            // Index for filtering by kecamatan
            $table->index('kecamatan_id', 'idx_pekerjaan_kecamatan_id');
            
            // Index for filtering by desa
            $table->index('desa_id', 'idx_pekerjaan_desa_id');
            
            // Composite index for kecamatan and desa filtering
            $table->index(['kecamatan_id', 'desa_id'], 'idx_pekerjaan_kecamatan_desa');
            
            // Index for kegiatan filtering
            $table->index('kegiatan_id', 'idx_pekerjaan_kegiatan_id');
        });

        Schema::table('tbl_foto', function (Blueprint $table) {
            // Index for filtering photos with coordinates
            $table->index(['pekerjaan_id', 'koordinat'], 'idx_foto_pekerjaan_koordinat');
            
            // Index for latest foto with coordinates query
            $table->index(['pekerjaan_id', 'koordinat', 'created_at'], 'idx_foto_pekerjaan_koordinat_created');
        });

        Schema::table('tbl_desa', function (Blueprint $table) {
            // Index for filtering desa by kecamatan
            $table->index('kecamatan_id', 'idx_desa_kecamatan_id');
        });

        Schema::table('tbl_kecamatan', function (Blueprint $table) {
            // Index for name lookups
            $table->index('n_kec', 'idx_kecamatan_name');
        });

        Schema::table('tbl_desa', function (Blueprint $table) {
            // Index for name lookups
            $table->index('n_desa', 'idx_desa_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_pekerjaan', function (Blueprint $table) {
            $table->dropIndex('idx_pekerjaan_kecamatan_id');
            $table->dropIndex('idx_pekerjaan_desa_id');
            $table->dropIndex('idx_pekerjaan_kecamatan_desa');
            $table->dropIndex('idx_pekerjaan_kegiatan_id');
        });

        Schema::table('tbl_foto', function (Blueprint $table) {
            $table->dropIndex('idx_foto_pekerjaan_koordinat');
            $table->dropIndex('idx_foto_pekerjaan_koordinat_created');
        });

        Schema::table('tbl_desa', function (Blueprint $table) {
            $table->dropIndex('idx_desa_kecamatan_id');
            $table->dropIndex('idx_desa_name');
        });

        Schema::table('tbl_kecamatan', function (Blueprint $table) {
            $table->dropIndex('idx_kecamatan_name');
        });
    }
}; 