<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Menu;
use App\Models\Role;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
            ['name' => 'dashboard', 'label' => 'Dashboard'],
            ['name' => 'kegiatan', 'label' => 'Kegiatan'],
            ['name' => 'pekerjaan', 'label' => 'Pekerjaan'],
            ['name' => 'peta', 'label' => 'Map'],
            ['name' => 'users', 'label' => 'Users'],
            ['name' => 'roles', 'label' => 'Roles'],
            ['name' => 'permissions', 'label' => 'Permissions'],
            ['name' => 'penyedia', 'label' => 'Penyedia'],
            ['name' => 'todos', 'label' => 'Todos'],
            ['name' => 'status', 'label' => 'Status'],
            ['name' => 'notifications.create', 'label' => 'Create Notification'],
            ['name' => 'kontrak', 'label' => 'Kontrak'],
            ['name' => 'progress', 'label' => 'Progress'],
            ['name' => 'keuangan', 'label' => 'Keuangan'],
            ['name' => 'output', 'label' => 'Output'],
            ['name' => 'dokumen-pekerjaan', 'label' => 'Dokumen Pekerjaan'],
            ['name' => 'settings/menu', 'label' => 'Menu Settings'],
        ];

        foreach ($menus as $menu) {
            Menu::firstOrCreate($menu);
        }

        // Assign all menus to Super Admin by default
        $superAdmin = Role::where('name', 'Super Admin')->first();
        if ($superAdmin) {
            $superAdmin->menus()->sync(Menu::all()->pluck('id'));
        }
    }
}