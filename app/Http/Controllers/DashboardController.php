<?php

namespace App\Http\Controllers;

use App\Models\Pekerjaan;
use App\Models\Kegiatan;
use App\Models\Penerima;
use App\Models\Keuangan;
use App\Models\Kontrak;
use App\Models\Progress;
use App\Models\Foto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistik Utama
        $stats = [
            'totalPekerjaan' => Pekerjaan::count(),
            'totalKegiatan' => Kegiatan::count(),
            'totalPenerima' => Penerima::count(),
            'realisasiKeuangan' => Keuangan::sum('realisasi'),
        ];

        // Pekerjaan Terbaru (5 terbaru)
        $recentPekerjaan = Pekerjaan::with(['kecamatan', 'desa'])
            ->latest()
            ->take(5)
            ->get(['id', 'nama_paket', 'pagu', 'kecamatan_id', 'desa_id', 'created_at'])
            ->map(function ($pekerjaan) {
                return [
                    'id' => $pekerjaan->id,
                    'nama_paket' => $pekerjaan->nama_paket,
                    'pagu' => $pekerjaan->pagu,
                    'kecamatan' => $pekerjaan->kecamatan ? $pekerjaan->kecamatan->nama : 'N/A',
                    'desa' => $pekerjaan->desa ? $pekerjaan->desa->nama : 'N/A',
                    'created_at' => $pekerjaan->created_at ? $pekerjaan->created_at->format('Y-m-d') : 'N/A',
                ];
            });

        // Data Progres untuk Grafik
        $progressData = Progress::with('pekerjaan')
            ->get()
            ->map(function ($progress) {
                return [
                    'nama_paket' => $progress->pekerjaan ? $progress->pekerjaan->nama_paket : 'Unknown',
                    'realisasi_fisik' => $progress->realisasi_fisik ?? 0,
                    'realisasi_keuangan' => $progress->realisasi_keuangan ?? 0,
                ];
            })->take(10);

        // Ringkasan Kontrak
        $kontrakStats = [
            'totalKontrak' => Kontrak::count(),
            'nilaiKontrak' => Kontrak::sum('nilai_kontrak'),
        ];

        // Data Foto untuk Peta dan Galeri
        $fotoData = Foto::with('pekerjaan')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($foto) {
                $media = $foto->getFirstMedia('foto/pekerjaan');
                $coordinates = $foto->koordinat ? explode(',', $foto->koordinat) : [null, null];
                return [
                    'id' => $foto->id,
                    'pekerjaan_id' => $foto->pekerjaan_id,
                    'nama_paket' => $foto->pekerjaan ? $foto->pekerjaan->nama_paket : 'N/A',
                    'keterangan' => $foto->keterangan ?? 'Tidak ada keterangan',
                    'foto_url' => $media ? $media->getUrl() : null,
                    'lat' => $coordinates[0] ? floatval($coordinates[0]) : null,
                    'lng' => $coordinates[1] ? floatval($coordinates[1]) : null,
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentPekerjaan' => $recentPekerjaan,
            'progressData' => $progressData,
            'kontrakStats' => $kontrakStats,
            'fotoData' => $fotoData,
        ]);
    }
}
