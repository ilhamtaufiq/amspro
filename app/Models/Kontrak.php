<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Kontrak extends Model
{
    use HasFactory, Searchable;
    
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
     * Get the index name for the model.
     */
    public function searchableAs()
    {
        return 'kontrak';
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray()
    {
        return [
            'id' => (string) $this->id,
            'kode_rup' => $this->kode_rup,
            'kode_paket' => $this->kode_paket,
            'nomor_penawaran' => $this->nomor_penawaran,
            'nilai_kontrak' => $this->nilai_kontrak,
            'nama_penyedia' => $this->penyedia->nama_penyedia ?? null,
            'nama_paket' => $this->pekerjaan->nama_paket ?? null,
            'sppbj' => $this->sppbj,
            'spk' => $this->spk,
            'spmk' => $this->spmk,
            'tanggal_penawaran' => $this->tanggal_penawaran ? $this->tanggal_penawaran->timestamp : null,
            'tgl_sppbj' => $this->tgl_sppbj ? $this->tgl_sppbj->timestamp : null,
            'tgl_spk' => $this->tgl_spk ? $this->tgl_spk->timestamp : null,
            'tgl_spmk' => $this->tgl_spmk ? $this->tgl_spmk->timestamp : null,
            'tgl_selesai' => $this->tgl_selesai ? $this->tgl_selesai->timestamp : null,
            'created_at' => $this->created_at ? $this->created_at->timestamp : null,
        ];
    }

    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable()
    {
        return !empty($this->kode_rup) || !empty($this->nomor_penawaran);
    }

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
}