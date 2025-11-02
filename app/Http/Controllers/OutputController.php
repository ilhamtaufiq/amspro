<?php

namespace App\Http\Controllers;

use App\Models\Output;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use DB;
class OutputController extends Controller
{
    /**
     * Display the dashboard page for outputs
     */
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

        $pekerjaanIds = $pekerjaanQuery->pluck('id');

        $outputs = DB::table('tbl_output as o')
            ->whereIn('o.pekerjaan_id', $pekerjaanIds)
            ->selectRaw('o.komponen, o.satuan, SUM(o.volume) as total_volume, COUNT(DISTINCT o.pekerjaan_id) as jumlah_pekerjaan')
            ->groupBy('o.komponen', 'o.satuan')
            ->orderBy('o.komponen')
            ->get();

        $summary = [
            'total_jenis_output' => $outputs->count(),
            'total_pekerjaan_dengan_output' => DB::table('tbl_output')->whereIn('pekerjaan_id', $pekerjaanIds)->distinct('pekerjaan_id')->count(),
        ];

        return Inertia::render('Output/Dashboard', [
            'summary' => $summary,
            'outputs' => $outputs,
            'filters' => ['tahun' => $tahun],
        ]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index($pekerjaanId)
    {
        // Since index is typically used for API, redirect to the detail page
        return redirect()->route('pekerjaan.show', $pekerjaanId);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, $pekerjaanId)
    {
        $validated = $request->validate([
            'komponen' => 'required|string|max:255',
            'satuan' => 'required|string|max:50',
            'volume' => 'required|numeric|min:0',
        ]);

        try {
            $pekerjaan = Pekerjaan::findOrFail($pekerjaanId);

            Output::create([
                'pekerjaan_id' => $pekerjaanId,
                'komponen' => $validated['komponen'],
                'satuan' => $validated['satuan'],
                'volume' => $validated['volume'],
            ]);

            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('success', 'Output berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menambahkan output: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($pekerjaanId, Output $output)
    {
        if ($output->pekerjaan_id != $pekerjaanId) {
            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('error', 'Output tidak ditemukan');
        }

        // Redirect to the detail page, as showing a single output is not typical
        return redirect()->route('pekerjaan.show', $pekerjaanId);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $pekerjaanId, Output $output)
    {
        if ($output->pekerjaan_id != $pekerjaanId) {
            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('error', 'Output tidak ditemukan');
        }

        $validated = $request->validate([
            'komponen' => 'required|string|max:255',
            'satuan' => 'required|string|max:50',
            'volume' => 'required|numeric|min:0',
        ]);

        try {
            $output->update([
                'komponen' => $validated['komponen'],
                'satuan' => $validated['satuan'],
                'volume' => $validated['volume'],
            ]);

            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('success', 'Output berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui output: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($pekerjaanId, Output $output)
    {
        if ($output->pekerjaan_id != $pekerjaanId) {
            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('error', 'Output tidak ditemukan');
        }

        try {
            $output->delete();

            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('success', 'Output berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus output: ' . $e->getMessage());
        }
    }
}