<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengawas extends Model
{
    use HasFactory;

    protected $table = 'pengawas';

    protected $fillable = [
        'pekerjaan_id',
        'pengawas1_id',
        'pengawas2_id',
    ];

    public function pekerjaan()
    {
        return $this->belongsTo(Pekerjaan::class);
    }

    public function pengawasSatu()
    {
        return $this->belongsTo(User::class, 'pengawas1_id');
    }

    public function pengawasDua()
    {
        return $this->belongsTo(User::class, 'pengawas2_id');
    }
}
