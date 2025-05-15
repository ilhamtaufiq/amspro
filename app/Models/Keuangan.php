<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Keuangan extends Model
{
    protected $table = 'tbl_keuangan';
    protected $fillable = ['pekerjaan_id', 'realisasi'];

    public function pekerjaan()
    {
        return $this->belongsTo(Pekerjaan::class, 'pekerjaan_id');
    }
}