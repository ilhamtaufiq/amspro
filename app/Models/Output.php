<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Output extends Model
{
    protected $table = 'tbl_output';

    protected $fillable = [
        'pekerjaan_id',
        'komponen',
        'satuan',
        'volume',
    ];

    public function pekerjaan()
    {
        return $this->belongsTo(Pekerjaan::class, 'pekerjaan_id');
    }
}
