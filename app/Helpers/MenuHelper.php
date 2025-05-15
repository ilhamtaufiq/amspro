<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Auth;

class MenuHelper
{
    public static function hasPermission($permission)
    {
        if (!Auth::check()) {
            return false;
        }

        return Auth::user()->hasPermissionTo($permission);
    }

    public static function getMenuItems()
    {
        return [
            [
                'name' => 'Dashboard',
                'route' => 'dashboard',
                'permission' => 'view_dashboard',
                'icon' => 'home'
            ],
            [
                'name' => 'Users',
                'route' => 'users.index',
                'permission' => 'view_users',
                'icon' => 'users'
            ],
            [
                'name' => 'Roles & Permissions',
                'route' => 'roles.index',
                'permission' => 'view_roles',
                'icon' => 'shield'
            ],
            [
                'name' => 'Pekerjaan',
                'route' => 'pekerjaan.index',
                'permission' => 'view_pekerjaan',
                'icon' => 'briefcase'
            ],
            [
                'name' => 'Kegiatan',
                'route' => 'kegiatan.index',
                'permission' => 'view_kegiatan',
                'icon' => 'calendar'
            ],
        ];
    }
} 