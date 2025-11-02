<?php

namespace App\Http\Controllers;

use App\Models\Keuangan;
use App\Models\Kontrak;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KeuanganController extends Controller
{
        public function dashboard(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('Super Admin');
        $tahun = $request->query('tahun', session('tahun', now()->year));

        // Base query for Pekerjaan, filtered by year and role
        $pekerjaanQuery = Pekerjaan::query()
            ->whereHas('kegiatan', fn ($q) => $q->where('tahun_anggaran', $tahun));

        if (!$isSuperAdmin) {
            $roleId = $user->roles->first()->id ?? null;
            if ($roleId) {
                $pekerjaanQuery->whereHas('kegiatan.roles', fn ($q) => $q->where('role_id', $roleId));
            } else {
                $pekerjaanQuery->whereRaw('1 = 0');
            }
        }

        // Get IDs of filtered pekerjaan
        $pekerjaanIds = $pekerjaanQuery->pluck('id');

        // Get aggregated data from the database
        $summary = DB::table('tbl_pekerjaan as p')
            ->join('tbl_kegiatan as k', 'p.kegiatan_id', '=', 'k.id')
            ->leftJoin('tbl_kontrak as kon', 'p.id', '=', 'kon.id_pekerjaan')
            ->leftJoin('tbl_keuangan as keu', 'p.id', '=', 'keu.pekerjaan_id')
            ->whereIn('p.id', $pekerjaanIds)
            ->selectRaw('SUM(p.pagu) as total_pagu, SUM(kon.nilai_kontrak) as total_kontrak, SUM(keu.realisasi) as total_realisasi')
            ->first();

        // Monthly spending
        $monthlySpending = DB::table('tbl_keuangan')
            ->whereIn('pekerjaan_id', $pekerjaanIds)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(realisasi) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->month => $item->total];
            });

        $months = collect(range(1, 12))->map(function ($month) use ($tahun, $monthlySpending) {
            $monthStr = sprintf('%04d-%02d', $tahun, $month);
            return [
                'name' => date('M', mktime(0, 0, 0, $month, 1)),
                'realisasi' => $monthlySpending[$monthStr] ?? 0,
            ];
        });

        // Chart by Kegiatan
        $byKegiatan = DB::table('tbl_pekerjaan as p')
            ->join('tbl_kegiatan as k', 'p.kegiatan_id', '=', 'k.id')
            ->leftJoin('tbl_kontrak as kon', 'p.id', '=', 'kon.id_pekerjaan')
            ->leftJoin('tbl_keuangan as keu', 'p.id', '=', 'keu.pekerjaan_id')
            ->whereIn('p.id', $pekerjaanIds)
            ->selectRaw('k.nama as nama_kegiatan, SUM(kon.nilai_kontrak) as nilai_kontrak, SUM(keu.realisasi) as realisasi')
            ->groupBy('k.nama')
            ->get();

        return Inertia::render('Keuangan/Dashboard', [
            'summary' => [
                'total_pagu' => (float) $summary->total_pagu,
                'total_kontrak' => (float) $summary->total_kontrak,
                'total_realisasi' => (float) $summary->total_realisasi,
                'sisa_pagu' => (float) $summary->total_pagu - (float) $summary->total_realisasi,
                'sisa_kontrak' => (float) $summary->total_kontrak - (float) $summary->total_realisasi,
                'persen_realisasi_pagu' => $summary->total_pagu > 0 ? ((float) $summary->total_realisasi / (float) $summary->total_pagu) * 100 : 0,
                'persen_realisasi_kontrak' => $summary->total_kontrak > 0 ? ((float) $summary->total_realisasi / (float) $summary->total_kontrak) * 100 : 0,
            ],
            'monthlySpending' => $months,
            'byKegiatan' => $byKegiatan,
            'filters' => ['tahun' => $tahun],
        ]);
    }
    public function show($pekerjaanId)
    {
        $keuangan = Keuangan::where('pekerjaan_id', $pekerjaanId)->first();
        return response()->json($keuangan);
    }

    public function store(Request $request, $pekerjaanId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'realisasi' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput()
                    ->with('error', 'Gagal menambahkan data keuangan.');
            }

            // Check if keuangan record already exists
            $existingKeuangan = Keuangan::where('pekerjaan_id', $pekerjaanId)->first();
            if ($existingKeuangan) {
                return redirect()->back()
                    ->withErrors(['pekerjaan_id' => 'Data keuangan untuk pekerjaan ini sudah ada. Silakan perbarui data yang ada.'])
                    ->withInput()
                    ->with('error', 'Gagal menambahkan data keuangan.');
            }

            // Validate against nilai_kontrak
            $kontrak = Kontrak::where('id_pekerjaan', $pekerjaanId)->first();
            if ($kontrak && $request->realisasi > $kontrak->nilai_kontrak) {
                return redirect()->back()
                    ->withErrors(['realisasi' => 'Realisasi keuangan tidak boleh melebihi nilai kontrak.'])
                    ->withInput()
                    ->with('error', 'Gagal menambahkan data keuangan.');
            }

            Keuangan::create([
                'pekerjaan_id' => $pekerjaanId,
                'realisasi' => $request->realisasi,
            ]);

            return redirect()->back()->with('success', 'Data keuangan berhasil ditambahkan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menambahkan data keuangan: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $pekerjaanId, Keuangan $keuangan)
    {
        try {
            $validator = Validator::make($request->all(), [
                'realisasi' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput()
                    ->with('error', 'Gagal memperbarui data keuangan.');
            }

            // Validate against nilai_kontrak
            $kontrak = Kontrak::where('id_pekerjaan', $pekerjaanId)->first();
            if ($kontrak && $request->realisasi > $kontrak->nilai_kontrak) {
                return redirect()->back()
                    ->withErrors(['realisasi' => 'Realisasi keuangan tidak boleh melebihi nilai kontrak.'])
                    ->withInput()
                    ->with('error', 'Gagal memperbarui data keuangan.');
            }

            $keuangan->update([
                'realisasi' => $request->realisasi,
            ]);

            return redirect()->back()->with('success', 'Data keuangan berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui data keuangan: ' . $e->getMessage());
        }
    }

    public function destroy($pekerjaanId, Keuangan $keuangan)
    {
        try {
            $keuangan->delete();
            return redirect()->back()->with('success', 'Data keuangan berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus data keuangan: ' . $e->getMessage());
        }
    }
}