<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Laravel\Scout\Searchable;

class Kontrak extends Model
{
    use HasFactory;
    // use Searchable;
    protected $table = 'tbl_kontrak';
    protected $fillable = [
        'id_kegiatan',
        'id_pekerjaan',
        'id_penyedia',
        'kode_rup',
        'kode_paket',
        'nomor_penawaran',
        'tanggal_penawaran',
        'nilai_kontrak',
        'tgl_sppbj',
        'tgl_spk',
        'tgl_spmk',
        'tgl_selesai',
        'sppbj',
        'spk',
        'spmk',
    ];

    protected $casts = [
        'tanggal_penawaran' => 'date',
        'tgl_sppbj' => 'date',
        'tgl_spk' => 'date',
        'tgl_spmk' => 'date',
        'tgl_selesai' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the penyedia associated with the Kontrak
     */
    public function penyedia()
    {
        return $this->hasOne(Penyedia::class, 'id', 'id_penyedia');
    }

    /**
     * Get the pekerjaan associated with the Kontrak
     */
    public function pekerjaan()
    {
        return $this->hasOne(Pekerjaan::class, 'id', 'id_pekerjaan');
    }
    public function toSearchableArray()
    {
        return [
            'nama_paket' => $this->nama_paket,
            'id_kegiatan' => $this->id_kegiatan,
            'id_pekerjaan' => $this->id_pekerjaan,
            'id_penyedia' => $this->id_penyedia,
            'kode_rup' => $this->kode_rup,
            'kode_paket' => $this->kode_paket,
            'nomor_penawaran' => $this->nomor_penawaran,
            'tanggal_penawaran' => $this->tanggal_penawaran,
            'nilai_kontrak' => $this->nilai_kontrak,            
            'tgl_sppbj' => $this->tgl_sppbj,
            'tgl_spk' => $this->tgl_spk,
            'tgl_spmk' => $this->tgl_spmk,
            'tgl_selesai' => $this->tgl_selesai,
            'sppbj' => $this->sppbj,
            'spk' => $this->spk,
            'spmk' => $this->spmk
        ];
    }
}