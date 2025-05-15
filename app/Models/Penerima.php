<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Penerima extends Model
{
    use HasFactory;
    protected $table = 'tbl_penerima';
    protected $fillable = [
        'pekerjaan_id',
        'nama',
        'nik',
        'jumlah_jiwa',
        'alamat',
    ];
    public function pekerjaan(): BelongsTo
    {
        return $this->belongsTo(Pekerjaan::class);
    }
}