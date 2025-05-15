<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penyedia extends Model
{
    protected $table = 'tbl_penyedia'; // Specify the table name

    protected $fillable = [
        'nama',
        'direktur',
        'no_akta',
        'notaris',
        'tanggal_akta',
        'alamat',
        'bank',
        'norek',
    ];

    protected $casts = [
        'tanggal_akta' => 'date', // Cast tanggal_akta as a date
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
