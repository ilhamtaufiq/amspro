<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;
use Laravel\Scout\Searchable;

class Pekerjaan extends Model
{
    use HasFactory;
    use Searchable;
    protected $table = "tbl_pekerjaan";
    protected $fillable = [
        'nama_paket',
        'pagu',
        'kode_rekening',
        'kegiatan_id',
        'kecamatan_id',
        'desa_id',
    ];

    /**
     * Configure the Meilisearch index settings.
     */
    public function configureSearchableIndex()
    {
        $engine = $this->searchableUsing();
        $engine->updateIndexSettings($this->searchableAs(), [
            'filterableAttributes' => ['tahun_anggaran', 'n_kec', 'n_desa'],
        ]);
    }

    /**
     * Get the index name for the model.
     */
    public function searchableAs()
    {
        return 'tbl_pekerjaan';
    }

    /**
     * Get the kegiatan associated with the Pekerjaan
     */
    public function kegiatan()
    {
        return $this->belongsTo(Kegiatan::class);
    }

    /**
     * Get all of the foto for the Pekerjaan
     */
    public function foto()
    {
        return $this->hasMany(Foto::class);
    }

    /**
     * Get all of the penerima for the Pekerjaan
     */
    public function penerima()
    {
        return $this->hasMany(Penerima::class, 'pekerjaan_id', 'id');
    }

    // Relasi ke kecamatan
    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class, 'kecamatan_id');
    }

    // Relasi ke desa
    public function desa()
    {
        return $this->belongsTo(Desa::class, 'desa_id');
    }

    public function berkas()
    {
        return $this->hasMany(Berkas::class, 'pekerjaan_id');
    }

    public function roles()
    {
        return $this->hasManyThrough(
            Role::class,
            Kegiatan::class,
            'id', // Foreign key on kegiatan table
            'id', // Foreign key on roles table
            'kegiatan_id', // Local key on pekerjaan table
            'id' // Local key on kegiatan table
        );
    }

    /**
     * Get all of the progresses for the Pekerjaan
     */
    public function progresses()
    {
        return $this->hasMany(Progress::class, 'pekerjaan_id');
    }

    /**
     * Get all of the outputs for the Pekerjaan
     */
    public function outputs()
    {
        return $this->hasMany(Output::class, 'pekerjaan_id');
    }

    public function keuangan()
    {
        return $this->hasOne(Keuangan::class, 'pekerjaan_id');
    }

    public function kontrak()
    {
        return $this->hasOne(Kontrak::class, 'id_pekerjaan');
    }

    public function penerimas()
    {
        return $this->hasMany(Penerima::class);
    }

    public function toSearchableArray()
    {
        return [
            'nama_paket' => $this->nama_paket,
            'tahun_anggaran' => $this->kegiatan->tahun_anggaran ?? null,
            'n_kec' => $this->kecamatan->n_kec ?? null,
            'n_desa' => $this->desa->n_desa ?? null,
        ];
    }
}
