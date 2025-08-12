<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Penyedia extends Model
{
    use Searchable;
    
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

    /**
     * Get the index name for the model.
     */
    public function searchableAs()
    {
        return 'penyedia';
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray()
    {
        return [
            'id' => (string) $this->id,
            'nama' => $this->nama,
            'direktur' => $this->direktur,
            'no_akta' => $this->no_akta,
            'notaris' => $this->notaris,
            'alamat' => $this->alamat,
            'bank' => $this->bank,
            'norek' => $this->norek,
            'tanggal_akta' => $this->tanggal_akta ? $this->tanggal_akta->timestamp : null,
            'created_at' => $this->created_at ? $this->created_at->timestamp : null,
        ];
    }

    /**
     * Determine if the model should be searchable.
     */
    public function shouldBeSearchable()
    {
        return !empty($this->nama);
    }
}
