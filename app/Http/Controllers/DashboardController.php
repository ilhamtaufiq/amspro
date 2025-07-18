<?php

namespace App\Http\Controllers;

use App\Models\Pekerjaan;
use App\Models\Kegiatan;
use App\Models\Penerima;
use App\Models\Keuangan;
use App\Models\Kontrak;
use App\Models\Progress;
use App\Models\Foto;
use App\Models\Todo;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $tahun = $request->query('tahun', date('Y'));

        // Query dasar untuk pekerjaan
        $pekerjaanQuery = Pekerjaan::query();

        if (!$user->hasRole('Super Admin')) {
            $roleId = $user->roles->first()->id ?? null;
            if ($roleId) {
                $pekerjaanQuery->whereExists(function ($subQuery) use ($roleId) {
                    $subQuery->select(DB::raw(1))
                             ->from('kegiatan_role')
                             ->whereColumn('kegiatan_role.kegiatan_id', 'tbl_pekerjaan.kegiatan_id')
                             ->where('kegiatan_role.role_id', $roleId);
                });
            } else {
                $pekerjaanQuery->whereRaw('1 = 0'); // No role, no data
            }
        }

        // Data Peta Lokasi
        $locations = (clone $pekerjaanQuery)->with('latestFotoWithCoordinates')
            ->whereHas('kegiatan', function ($query) use ($tahun) {
                $query->where('tahun_anggaran', $tahun);
            })
            ->get()
            ->map(function ($pekerjaan) {
                if ($pekerjaan->latestFotoWithCoordinates) {
                    $coordinates = explode(',', $pekerjaan->latestFotoWithCoordinates->koordinat);
                    return [
                        'id' => $pekerjaan->id,
                        'nama_paket' => $pekerjaan->nama_paket,
                        'lat' => $coordinates[0] ? floatval($coordinates[0]) : null,
                        'lng' => $coordinates[1] ? floatval($coordinates[1]) : null,
                    ];
                }
                return null;
            })
            ->filter();

        if (!$user->hasRole('Super Admin')) {
            return Inertia::render('dashboard', [
                'locations' => $locations,
                'tahun_aktif' => (int) $tahun,
                'isSuperAdmin' => false,
            ]);
        }

        // Statistik Utama
        $stats = [
            'totalPekerjaan' => (clone $pekerjaanQuery)->whereHas('kegiatan', function ($query) use ($tahun) {
                $query->where('tahun_anggaran', $tahun);
            })->count(),
            'totalKegiatan' => Kegiatan::where('tahun_anggaran', $tahun)->count(),
            'totalPenerima' => Penerima::whereHas('pekerjaan', function ($query) use ($pekerjaanQuery, $tahun) {
                $query->whereHas('kegiatan', function ($q) use ($tahun) {
                    $q->where('tahun_anggaran', $tahun);
                });
            })->count(),
            'realisasiKeuangan' => Keuangan::whereHas('pekerjaan', function ($query) use ($pekerjaanQuery, $tahun) {
                $query->whereHas('kegiatan', function ($q) use ($tahun) {
                    $q->where('tahun_anggaran', $tahun);
                });
            })->sum('realisasi'),
        ];

        // Pekerjaan Terbaru
        $recentPekerjaan = (clone $pekerjaanQuery)->with(['kegiatan', 'kecamatan', 'desa'])
            ->whereHas('kegiatan', function ($query) use ($tahun) {
                $query->where('tahun_anggaran', $tahun);
            })
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
        $progressData = Progress::whereHas('pekerjaan', function ($query) use ($pekerjaanQuery, $tahun) {
            $query->whereHas('kegiatan', function ($q) use ($tahun) {
                $q->where('tahun_anggaran', $tahun);
            });
        })
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
            'totalKontrak' => Kontrak::whereHas('pekerjaan', function ($query) use ($pekerjaanQuery, $tahun) {
                $query->whereHas('kegiatan', function ($q) use ($tahun) {
                    $q->where('tahun_anggaran', $tahun);
                });
            })->count(),
            'nilaiKontrak' => Kontrak::whereHas('pekerjaan', function ($query) use ($pekerjaanQuery, $tahun) {
                $query->whereHas('kegiatan', function ($q) use ($tahun) {
                    $q->where('tahun_anggaran', $tahun);
                });
            })->sum('nilai_kontrak'),
        ];

        // Data Todo Terbaru
        $recentTodos = Todo::latest()->take(5)->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentPekerjaan' => $recentPekerjaan,
            'progressData' => $progressData,
            'kontrakStats' => $kontrakStats,
            'locations' => $locations,
            'recentTodos' => $recentTodos,
            'tahun_aktif' => (int) $tahun,
            'isSuperAdmin' => true,
        ]);
    }
}
