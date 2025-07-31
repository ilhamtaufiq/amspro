<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Kegiatan;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::with(['permissions', 'kegiatan'])->get();
        $permissions = Permission::all();
        $kegiatanList = Kegiatan::all(['id', 'nama']);

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'kegiatanList' => $kegiatanList,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id',
            'kegiatan' => 'nullable|array',
            'kegiatan.*' => 'exists:tbl_kegiatan,id',
        ]);

        try {
            $role = Role::create(['name' => $validated['name']]);
            $role->syncPermissions($validated['permissions']);
            if (!empty($validated['kegiatan'])) {
                $role->kegiatan()->sync($validated['kegiatan']);
            }

            return redirect()->back()->with('success', 'Role created successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create role: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $id,
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'exists:permissions,id',
            'kegiatan' => 'nullable|array',
            'kegiatan.*' => 'exists:tbl_kegiatan,id',
        ]);

        try {
            $role = Role::findOrFail($id);
            $role->update(['name' => $validated['name']]);
            $role->syncPermissions($validated['permissions']);
            if (isset($validated['kegiatan'])) {
                $role->kegiatan()->sync($validated['kegiatan']);
            } else {
                $role->kegiatan()->detach();
            }

            return redirect()->back()->with('success', 'Role updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update role: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $role = Role::findOrFail($id);
            $role->delete();

            return redirect()->back()->with('success', 'Role deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete role: ' . $e->getMessage());
        }
    }
}
