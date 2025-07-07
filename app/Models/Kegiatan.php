<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kegiatan extends Model
{
    use HasFactory;
    protected $table = 'tbl_kegiatan';
    protected $fillable = ['nama', 'bidang', 'tahun_anggaran', 'sumber_dana'];

    /**
     * Get all of the comments for the Kegiatan
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function pekerjaan()
    {
        return $this->hasMany(Pekerjaan::class, 'kegiatan_id','id');
    }
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'kegiatan_role', 'kegiatan_id', 'role_id')
                    ->withTimestamps();
    }
}
