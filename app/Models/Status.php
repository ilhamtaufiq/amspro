<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    protected $table = 'tbl_status';

    protected $fillable = [
        'pekerjaan_id',
        'kontrak',
        'nphd',
        'review',
    ];

    protected $casts = [
        'kontrak' => 'boolean',
        'nphd' => 'boolean',
        'review' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the pekerjaan associated with the Status
     */
    public function pekerjaan()
    {
        return $this->belongsTo(Pekerjaan::class, 'pekerjaan_id');
    }
}
