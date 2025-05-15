<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Desa extends Model
{
    use HasFactory;
    protected $table = 'tbl_desa';

    /**
     * Get the kecamatan that owns the Desa
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class,'kecamatan_id');
    }
    public function pekerjaan()
    {
        return $this->hasMany(Pekerjaan::class, 'desa_id');
    }
}
