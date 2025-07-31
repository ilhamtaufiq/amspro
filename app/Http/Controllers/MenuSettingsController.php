<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MenuSettingsController extends Controller
{
    public function index()
    {
        $menus = Menu::with('roles')->get();
        $roles = Role::all();

        return Inertia::render('settings/menu', [
            'menus' => $menus,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $menu = Menu::findOrFail($request->menu_id);
        $role = Role::findOrFail($request->role_id);

        if ($request->enabled) {
            $menu->roles()->syncWithoutDetaching($role);
        } else {
            $menu->roles()->detach($role);
        }

        return back();
    }
}