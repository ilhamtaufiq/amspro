<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Foto extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'tbl_foto';

    protected $fillable = [
        'pekerjaan_id',
        'komponen_id',
        'penerima_id',
        'koordinat',
        'keterangan',
    ];

    protected $casts = [
        'keterangan' => 'string', // Ensure keterangan is treated as a string
    ];

    public function pekerjaan()
    {
        return $this->belongsTo(Pekerjaan::class, 'pekerjaan_id');
    }

    public function penerima()
    {
        return $this->belongsTo(Penerima::class, 'penerima_id');
    }

    public function output()
    {
        return $this->belongsTo(Output::class, 'komponen_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('foto/pekerjaan')
             ->singleFile()
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif']);
    }
}