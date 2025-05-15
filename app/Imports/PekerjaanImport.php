<?php

namespace App\Imports;

use App\Models\Pekerjaan;
use App\Models\Kegiatan;
use App\Models\Kecamatan;
use App\Models\Desa;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class PekerjaanImport implements ToModel, WithHeadingRow, WithValidation
{
    protected $tahun;

    public function __construct($tahun)
    {
        $this->tahun = $tahun;
    }

    public function model(array $row)
    {
        // Cari kegiatan berdasarkan nama
        $kegiatan = Kegiatan::where('nama', $row['kegiatan'])
            ->where('tahun_anggaran', $this->tahun)
            ->first();

        // Cari kecamatan berdasarkan nama
        $kecamatan = !empty($row['kecamatan'])
            ? Kecamatan::where('n_kec', $row['kecamatan'])->first()
            : null;

        // Cari desa berdasarkan nama dan kecamatan_id
        $desa = !empty($row['desa']) && $kecamatan
            ? Desa::where('n_desa', $row['desa'])
                ->where('kecamatan_id', $kecamatan->id)
                ->first()
            : null;

        return new Pekerjaan([
            'kode_rekening' => $row['kode_rekening'] ?? null,
            'nama_paket' => $row['nama_paket'],
            'pagu' => $row['pagu'],
            'kegiatan_id' => $kegiatan ? $kegiatan->id : null,
            'kecamatan_id' => $kecamatan ? $kecamatan->id : null,
            'desa_id' => $desa ? $desa->id : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'nama_paket' => 'required|string|max:255',
            'kegiatan' => 'required|string|exists:tbl_kegiatan,nama',
            'pagu' => 'required|numeric|min:0',
            'kecamatan' => 'nullable|string|exists:tbl_kecamatan,n_kec',
            'desa' => 'nullable|string',
            'kode_rekening' => 'nullable|string|max:255',
        ];
    }

    public function customValidationMessages()
    {
        return [
            'nama_paket.required' => 'Nama paket wajib diisi.',
            'kegiatan.required' => 'Kegiatan wajib diisi.',
            'kegiatan.exists' => 'Kegiatan tidak ditemukan di database.',
            'pagu.required' => 'Pagu wajib diisi.',
            'pagu.numeric' => 'Pagu harus berupa angka.',
            'kecamatan.exists' => 'Kecamatan tidak ditemukan di database.',
        ];
    }
}