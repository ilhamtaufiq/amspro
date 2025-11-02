<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\Output;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProgressController extends Controller
{
        public function dashboard(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('Super Admin');
        $tahun = $request->query('tahun', session('tahun', now()->year));

        // Base query for Pekerjaan
        $pekerjaanQuery = Pekerjaan::query()
            ->with(['kegiatan', 'progresses', 'outputs', 'kontrak'])
            ->whereHas('kegiatan', fn ($q) => $q->where('tahun_anggaran', $tahun));

        // Apply role-based filtering
        if (!$isSuperAdmin) {
            $roleId = $user->roles->first()->id ?? null;
            if ($roleId) {
                $pekerjaanQuery->whereHas('kegiatan.roles', fn ($q) => $q->where('role_id', $roleId));
            } else {
                $pekerjaanQuery->whereRaw('1 = 0'); // No role, no data
            }
        }

        $pekerjaanList = $pekerjaanQuery->get();

        $totalPagu = $pekerjaanList->sum('pagu');
        $totalWeightedProgress = 0;
        $totalPekerjaan = $pekerjaanList->count();
        $pekerjaanSelesai = 0;
        $statusCounts = ['kritis' => 0, 'terlambat' => 0, 'sesuai' => 0, 'cepat' => 0, 'selesai' => 0];
        
        $progressPerKegiatan = [];

        $pekerjaanList->each(function ($p) use (&$totalWeightedProgress, $totalPagu, &$pekerjaanSelesai, &$statusCounts, &$progressPerKegiatan) {
            $progressFisik = $p->getProgresFisikPersen();
            
            if ($p->pagu > 0 && $totalPagu > 0) {
                $totalWeightedProgress += $progressFisik * ($p->pagu / $totalPagu);
            }

            if ($progressFisik >= 100) {
                $pekerjaanSelesai++;
                $statusCounts['selesai']++;
            } else {
                $tglSelesai = $p->kontrak->tgl_selesai ?? null;
                if ($tglSelesai) {
                    $sisaHari = now()->diffInDays($tglSelesai, false);
                    $sisaProgress = 100 - $progressFisik;

                    if ($sisaHari < 0) {
                        $statusCounts['kritis']++;
                    } elseif ($sisaHari > 0 && $sisaProgress > 0 && ($sisaProgress / $sisaHari) > (100 / now()->diffInDays($p->kontrak->tgl_spk, false))) {
                        $statusCounts['terlambat']++;
                    } elseif ($sisaHari > 0 && $sisaProgress <= 0) {
                        $statusCounts['cepat']++;
                    } else {
                        $statusCounts['sesuai']++;
                    }
                } else {
                    $statusCounts['sesuai']++;
                }
            }

            // Aggregate progress by kegiatan
            $kegiatanNama = $p->kegiatan->nama ?? 'Lainnya';
            if (!isset($progressPerKegiatan[$kegiatanNama])) {
                $progressPerKegiatan[$kegiatanNama] = ['total_weighted_progress' => 0, 'total_pagu' => 0, 'count' => 0];
            }
            $progressPerKegiatan[$kegiatanNama]['total_weighted_progress'] += $progressFisik * $p->pagu;
            $progressPerKegiatan[$kegiatanNama]['total_pagu'] += $p->pagu;
            $progressPerKegiatan[$kegiatanNama]['count']++;
        });

        $chartProgressByKegiatan = collect($progressPerKegiatan)->map(function ($item, $key) {
            $avgProgress = $item['total_pagu'] > 0 ? $item['total_weighted_progress'] / $item['total_pagu'] : 0;
            return [
                'name' => $key,
                'progress' => round($avgProgress, 2),
            ];
        })->values()->toArray();

        $summary = [
            'overall_progress' => round($totalWeightedProgress, 2),
            'total_pekerjaan' => $totalPekerjaan,
            'pekerjaan_selesai' => $pekerjaanSelesai,
            'pekerjaan_berjalan' => $totalPekerjaan - $pekerjaanSelesai,
        ];

        return Inertia::render('Progress/Dashboard', [
            'summary' => $summary,
            'statusCounts' => $statusCounts,
            'chartProgressByKegiatan' => $chartProgressByKegiatan,
            'filters' => ['tahun' => $tahun],
        ]);
    }
    public function index($pekerjaanId)
    {
        $progresses = Progress::with('output')->where('pekerjaan_id', $pekerjaanId)->get();
        return response()->json($progresses);
    }

    public function store(Request $request, $pekerjaanId)
    {
        $validator = Validator::make($request->all(), [
            'komponen_id' => 'required|exists:tbl_output,id',
            'realisasi_fisik' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Gagal menambahkan data progress.');
        }

        try {
            // Check if a progress record already exists for this komponen_id and pekerjaan_id
            $existingProgress = Progress::where('pekerjaan_id', $pekerjaanId)
                ->where('komponen_id', $request->komponen_id)
                ->first();

            if ($existingProgress) {
                return redirect()->back()
                    ->withErrors(['komponen_id' => 'Komponen ini sudah memiliki data progress. Silakan perbarui data yang ada.'])
                    ->withInput()
                    ->with('error', 'Gagal menambahkan data progress.');
            }

            Progress::create([
                'pekerjaan_id' => $pekerjaanId,
                'komponen_id' => $request->komponen_id,
                'realisasi_fisik' => $request->realisasi_fisik,
            ]);

            return redirect()->back()->with('success', 'Data progress berhasil ditambahkan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menambahkan data progress: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $pekerjaanId, Progress $progress)
    {
        $validator = Validator::make($request->all(), [
            'komponen_id' => 'required|exists:tbl_output,id',
            'realisasi_fisik' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Gagal memperbarui data progress.');
        }

        try {
            $progress->update([
                'komponen_id' => $request->komponen_id,
                'realisasi_fisik' => $request->realisasi_fisik,
            ]);

            return redirect()->back()->with('success', 'Data progress berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui data progress: ' . $e->getMessage());
        }
    }

    public function destroy($pekerjaanId, Progress $progress)
    {
        try {
            $progress->delete();
            return redirect()->back()->with('success', 'Data progress berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus data progress: ' . $e->getMessage());
        }
    }
}