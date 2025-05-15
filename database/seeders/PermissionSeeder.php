<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        // Define permissions
        $permissions = [
            'view users', 'create users', 'edit users', 'delete users',
            'view pekerjaan', 'create pekerjaan', 'edit pekerjaan', 'delete pekerjaan',
            'view kegiatan', 'create kegiatan', 'edit kegiatan', 'delete kegiatan',
            'view roles', 'create roles', 'edit roles', 'delete roles',
        ];

        // Create permissions (only if they don't exist)
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Fetch existing roles from the database
        $superAdmin = Role::where('name', 'Super Admin')->first();
        $pengawasLapangan = Role::where('name', 'Pengawas Lapangan')->first();
        $tenagaFasilitator = Role::where('name', 'Tenaga Fasilitator Sanitasi DAK')->first();

        if ($superAdmin) {
            // Assign all permissions to Super Admin
            $superAdmin->givePermissionTo($permissions);
        }

        if ($pengawasLapangan) {
            // Assign limited permissions for Pengawas Lapangan (e.g., view and manage pekerjaan and kegiatan)
            $pengawasLapangan->givePermissionTo([
                'view pekerjaan', 'edit pekerjaan', 'view kegiatan', 'edit kegiatan',
            ]);
        }

        if ($tenagaFasilitator) {
            // Assign limited permissions for Tenaga Fasilitator Sanitasi DAK (e.g., view and manage related data)
            $tenagaFasilitator->givePermissionTo([
                'view pekerjaan', 'view kegiatan',
            ]);
        }
    }
}
