<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Progress extends Model
{
    protected $table = 'tbl_progress';

    protected $fillable = [
        'pekerjaan_id',
        'komponen_id',
        'realisasi_fisik',
        'realisasi_keuangan',
    ];

    public function pekerjaan()
    {
        return $this->belongsTo(Pekerjaan::class, 'pekerjaan_id');
    }

    public function output()
    {
        return $this->belongsTo(Output::class, 'komponen_id');
    }
}