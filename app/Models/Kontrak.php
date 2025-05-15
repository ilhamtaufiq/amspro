<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kontrak extends Model
{
    use HasFactory;
    protected $table = 'tbl_kontrak';
    protected $fillable = [
        'id_kegiatan',
        'id_pekerjaan',
        'id_penyedia',
        'kode_rup' ,
        'kode_paket' ,
        'nomor_penawaran' ,
        'tanggal_penawaran',
        'nilai_kontrak',
        'mulai',
        'selesai',
        'sppbj' ,
        'spk' ,
        'spmk' ,
    ];

    /**
     * Get the penyedia associated with the Kontrak
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function penyedia()
    {
        return $this->hasOne(Penyedia::class, 'id', 'id_penyedia');
    }

    /**
     * Get the pekerjaan associated with the Kontrak
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function pekerjaan()
    {
        return $this->hasOne(Pekerjaan::class, 'id', 'id_pekerjaan');
    }
}
