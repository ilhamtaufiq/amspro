<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Berkas extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'tbl_berkas';
    
    protected $fillable = [
        'pekerjaan_id',
        'jenis_dokumen',
    ];

    public function pekerjaan()
    {
        return $this->belongsTo(Pekerjaan::class, 'pekerjaan_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('berkas/dokumen')
             ->singleFile()
             ->acceptsMimeTypes([
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
    }
}