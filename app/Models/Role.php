<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $fillable = [
        'name',
        'guard_name',
    ];

    /**
     * Get the kegiatan associated with the role.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function kegiatan()
    {
        return $this->belongsToMany(Kegiatan::class, 'kegiatan_role', 'role_id', 'kegiatan_id')
                    ->withTimestamps();
    }
}
