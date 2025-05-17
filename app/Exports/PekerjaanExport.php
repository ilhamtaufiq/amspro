<?php

namespace App\Exports;

use App\Models\Pekerjaan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PekerjaanExport implements FromCollection, WithHeadings, WithMapping
{
    protected $tahun;
    protected $search;

    public function __construct($tahun, $search = '')
    {
        $this->tahun = $tahun;
        $this->search = $search;
    }

    public function collection()
    {
        $query = Pekerjaan::with(['kegiatan', 'kecamatan', 'desa'])
            ->whereHas('kegiatan', function ($query) {
                $query->where('tahun_anggaran', $this->tahun);
            });

        if ($this->search) {
            $query->where(function ($q) {
                $q->where('nama_paket', 'like', '%' . $this->search . '%')
                    ->orWhereHas('kecamatan', function ($q) {
                        $q->where('n_kec', 'like', '%' . $this->search . '%');
                    })
                    ->orWhereHas('desa', function ($q) {
                        $q->where('n_desa', 'like', '%' . $this->search . '%');
                    });
            });
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Kode Rekening',
            'Nama Paket',
            'Kegiatan',
            'Kecamatan',
            'Desa',
            'Pagu (Rp)',
            'Tahun Anggaran',
            'Tanggal Dibuat',
            'Tanggal Diperbarui',
        ];
    }

    public function map($pekerjaan): array
    {
        static $rowNumber = 0;
        $rowNumber++;

        return [
            $pekerjaan->id,
            $pekerjaan->kode_rekening ?? '-',
            $pekerjaan->nama_paket,
            $pekerjaan->kegiatan ? $pekerjaan->kegiatan->nama : '-',
            $pekerjaan->kecamatan ? $pekerjaan->kecamatan->n_kec : '-',
            $pekerjaan->desa ? $pekerjaan->desa->n_desa : '-',
            $pekerjaan->pagu,
            $pekerjaan->kegiatan ? $pekerjaan->kegiatan->tahun_anggaran : '-',
            $pekerjaan->created_at ? $pekerjaan->created_at->toDateTimeString() : '-',
            $pekerjaan->updated_at ? $pekerjaan->updated_at->toDateTimeString() : '-',
        ];
    }
}
