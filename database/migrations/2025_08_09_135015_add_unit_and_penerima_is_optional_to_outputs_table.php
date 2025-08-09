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
        Schema::table('tbl_output', function (Blueprint $table) {
            $table->string('unit')->nullable()->after('volume');
            $table->boolean('penerima_is_optional')->default(false)->after('unit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbl_output', function (Blueprint $table) {
            $table->dropColumn(['unit', 'penerima_is_optional']);
        });
    }
};
