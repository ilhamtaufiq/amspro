<?php

namespace App\Http\Controllers;

use App\Models\Status;
use App\Models\Pekerjaan;
use App\Models\Kontrak;
use App\Models\Penyedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StatusController extends Controller
{
    public function index(Request $request)
    {
        $tahun = $request->session()->get('tahun', now()->year);
        $perPage = $request->query('per_page', 10);
        $search = $request->query('search'); // Ambil parameter search

        Log::info('Tahun aktif:', ['tahun' => $tahun]);
        if ($search) {
            Log::info('Search query:', ['search' => $search]);
        }

        // Ambil semua pekerjaan yang memiliki kontrak
        $query = Pekerjaan::query()
            ->whereHas('kegiatan', function ($q) use ($tahun) {
                $q->where('tahun_anggaran', $tahun);
                Log::info('Filtering kegiatan with tahun_anggaran:', ['tahun' => $tahun]);
            })
            ->whereHas('kontrak', function ($q) {
                $q->whereNotNull('id_pekerjaan');
                Log::info('Filtering pekerjaan with kontrak');
            })
            ->with(['kontrak', 'kontrak.penyedia', 'kegiatan']);

        // Tambahkan filter pencarian
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_paket', 'like', "%{$search}%")
                  ->orWhereHas('kontrak.penyedia', function ($q) use ($search) {
                      $q->where('nama', 'like', "%{$search}%");
                  });
            });
        }

        $pekerjaan = $query->paginate($perPage)->withQueryString();

        Log::info('Fetched pekerjaan:', [
            'count' => $pekerjaan->count(),
            'pekerjaan_ids' => $pekerjaan->pluck('id')->toArray(),
        ]);

        // Buat atau perbarui entri di tbl_status untuk setiap pekerjaan
        $statuses = $pekerjaan->through(function ($p) {
            // Create or update status untuk pekerjaan ini
            $status = Status::firstOrCreate(
                ['pekerjaan_id' => $p->id],
                ['kontrak' => false, 'nphd' => false, 'review' => false]
            );

            Log::info('Processed status for pekerjaan:', [
                'pekerjaan_id' => $p->id,
                'status' => $status->toArray(),
                'nama_pekerjaan' => $p->nama_paket ?? 'N/A',
                'penyedia' => $p->kontrak && $p->kontrak->penyedia ? $p->kontrak->penyedia->nama : 'N/A',
                'tgl_spmk' => $p->kontrak ? $p->kontrak->tgl_spmk : 'N/A',
                'tgl_selesai' => $p->kontrak ? $p->kontrak->tgl_selesai : 'N/A',
                'pagu' => $p->pagu ?? 'N/A',
                'nilai_kontrak' => $p->kontrak ? $p->kontrak->nilai_kontrak : 'N/A',
            ]);

            return [
                'id' => $status->id,
                'pekerjaan_id' => $p->id,
                'nama_pekerjaan' => $p->nama_paket ?? 'N/A',
                'tgl_spmk' => $p->kontrak ? $p->kontrak->tgl_spmk : 'N/A',
                'tgl_selesai' => $p->kontrak ? $p->kontrak->tgl_selesai : 'N/A',
                'penyedia' => $p->kontrak && $p->kontrak->penyedia ? $p->kontrak->penyedia->nama : 'N/A',
                'pagu' => $p->pagu ?? 0,
                'nilai_kontrak' => $p->kontrak ? $p->kontrak->nilai_kontrak : 0,
                'kontrak' => $status->kontrak,
                'nphd' => $status->nphd,
                'review' => $status->review,
            ];
        });

        // Log data akhir yang dikirim ke frontend
        Log::info('Final statuses sent to frontend:', [
            'statuses' => $statuses->toArray(),
        ]);

        // Konversi data paginasi ke array
        $paginationData = $pekerjaan->toArray();

        return inertia('status/index', [
            'statuses' => $statuses,
            'meta' => [
                'current_page' => $pekerjaan->currentPage(),
                'last_page' => $pekerjaan->lastPage(),
                'from' => $pekerjaan->firstItem(),
                'to' => $pekerjaan->lastItem(),
                'total' => $pekerjaan->total(),
                'per_page' => $perPage,
                'links' => array_map(function ($link) {
                    return [
                        'url' => $link['url'],
                        'label' => $link['label'],
                        'active' => $link['active'],
                    ];
                }, $paginationData['links']),
            ],
            'tahun' => $tahun,
        ]);
    }

    public function update(Request $request, Status $status)
    {
        $request->validate([
            'kontrak' => 'required|boolean',
            'nphd' => 'required|boolean',
            'review' => 'required|boolean',
        ]);

        $status->update([
            'kontrak' => $request->kontrak,
            'nphd' => $request->nphd,
            'review' => $request->review,
        ]);

        return redirect()->back()->with('success', 'Pekerjaan updated successfully');
    }
}
