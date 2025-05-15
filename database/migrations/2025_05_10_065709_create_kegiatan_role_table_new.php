<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateKegiatanRoleTableNew extends Migration
{
    public function up()
    {
        // Create the kegiatan_role table if it doesn't exist
        if (!Schema::hasTable('kegiatan_role')) {
            Schema::create('kegiatan_role', function (Blueprint $table) {
                $table->id();
                $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
                $table->foreignId('kegiatan_id')->constrained('tbl_kegiatan')->onDelete('cascade');
                $table->timestamps();
            });
        }

        // Migrate existing kegiatan_id data to the pivot table
        $roles = \App\Models\Role::all();
        foreach ($roles as $role) {
            if (!empty($role->kegiatan_id) && is_array($role->kegiatan_id)) {
                $role->kegiatan()->sync($role->kegiatan_id);
            }
        }

        // Drop the kegiatan_id column from the roles table if it exists
        if (Schema::hasColumn('roles', 'kegiatan_id')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropColumn('kegiatan_id');
            });
        }
    }

    public function down()
    {
        // Add the kegiatan_id column back to the roles table
        if (!Schema::hasColumn('roles', 'kegiatan_id')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->json('kegiatan_id')->nullable();
            });
        }

        // Migrate data from the pivot table back to the kegiatan_id column
        $roles = \App\Models\Role::with('kegiatan')->get();
        foreach ($roles as $role) {
            $kegiatanIds = $role->kegiatan->pluck('id')->toArray();
            $role->update(['kegiatan_id' => $kegiatanIds]);
        }

        // Drop the kegiatan_role table if it exists
        Schema::dropIfExists('kegiatan_role');
    }
}
