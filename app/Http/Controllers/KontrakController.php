<?php

namespace App\Http\Controllers;

use App\Models\Kontrak;
use App\Models\Pekerjaan;
use App\Models\Penyedia;
use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class KontrakController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tahun = $request->query('tahun', session('tahun', now()->year));
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);
        $kegiatanId = $request->query('kegiatan_id');

        $query = Kontrak::with(['penyedia', 'pekerjaan'])->whereHas('pekerjaan.kegiatan', function ($query) use ($tahun) {
            $query->where('tahun_anggaran', $tahun);
        });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('kode_rup', 'like', '%' . $search . '%')
                    ->orWhere('kode_paket', 'like', '%' . $search . '%')
                    ->orWhere('nomor_penawaran', 'like', '%' . $search . '%')
                    ->orWhereHas('pekerjaan', function ($q2) use ($search) {
                        $q2->where('nama_paket', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('penyedia', function ($q2) use ($search) {
                        $q2->whereRaw('LOWER(nama) LIKE ?', ['%' . strtolower($search) . '%']);
                    });
            });
        }

        if ($kegiatanId) {
            $query->whereHas('pekerjaan', function ($q) use ($kegiatanId) {
                $q->where('kegiatan_id', $kegiatanId);
            });
        }

        $kontrak = $query->paginate($perPage)->withQueryString();

        return Inertia::render('kontrak/index', [
            'kontrak' => $kontrak->items(),
            'meta' => [
                'current_page' => $kontrak->currentPage(),
                'from' => $kontrak->firstItem(),
                'to' => $kontrak->lastItem(),
                'total' => $kontrak->total(),
                'per_page' => $kontrak->perPage(),
                'last_page' => $kontrak->lastPage(),
                'links' => collect($kontrak->linkCollection())->map(function ($link) {
                    return [
                        'url' => $link['url'],
                        'label' => strip_tags($link['label']),
                        'active' => $link['active'],
                    ];
                }),
            ],
            'search' => $search,
            'tahun' => $tahun,
            'kegiatanList' => Kegiatan::where('tahun_anggaran', $tahun)->get(),
            'kegiatan_id' => $kegiatanId,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tahun = session('tahun', now()->year);
        $pekerjaanList = Pekerjaan::whereDoesntHave('kontrak')
            ->whereHas('kegiatan', function ($query) use ($tahun) {
                $query->where('tahun_anggaran', $tahun);
            })
            ->select('id', 'nama_paket', 'pagu')->get();
        $penyediaList = Penyedia::select('id', 'nama')->get();

        return Inertia::render('kontrak/create', [
            'pekerjaanList' => $pekerjaanList,
            'penyediaList' => $penyediaList,
            'tahun' => $tahun,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function storeOrUpdate(Request $request)
    {
        $validatedData = $request->validate([
            'id_pekerjaan' => 'required|exists:tbl_pekerjaan,id',
            'id_penyedia' => 'nullable|exists:tbl_penyedia,id',
            'kode_rup' => 'nullable|string|max:255',
            'kode_paket' => 'nullable|string|max:255',
            'nomor_penawaran' => 'nullable|string|max:255',
            'tanggal_penawaran' => 'nullable|date',
            'nilai_kontrak' => 'nullable|numeric',
            'tgl_sppbj' => 'nullable|date',
            'tgl_spk' => 'nullable|date',
            'tgl_spmk' => 'nullable|date',
            'tgl_selesai' => 'nullable|date',
            'sppbj' => 'nullable|string|max:255',
            'spk' => 'nullable|string|max:255',
            'spmk' => 'nullable|string|max:255',
        ]);

        try {
            $pekerjaan = Pekerjaan::find($validatedData['id_pekerjaan']);

            if ($request->nilai_kontrak > $pekerjaan->pagu) {
                return redirect()->back()->withErrors(['nilai_kontrak' => 'Nilai kontrak tidak boleh melebihi pagu pekerjaan.'])->withInput()->with('error', 'Gagal menyimpan data kontrak.');
            }

            // id_kegiatan is derived from the pekerjaan
            $validatedData['id_kegiatan'] = $pekerjaan->kegiatan_id;

            Kontrak::updateOrCreate(
                ['id_pekerjaan' => $validatedData['id_pekerjaan']],
                $validatedData
            );

            return redirect()->route('pekerjaan.show', ['pekerjaan' => $pekerjaan->id])->with('success', 'Data kontrak berhasil disimpan.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data kontrak: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Kontrak $kontrak)
    {
        Log::info('Showing kontrak', ['id' => $kontrak->id]);
        return Inertia::render('PekerjaanDetail', [
            'pekerjaan' => $kontrak->pekerjaan,
            'kontrak' => $kontrak,
            'penyediaList' => \App\Models\Penyedia::all(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kontrak $kontrak)
    {
        return $this->show($kontrak);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'id_kegiatan' => 'required|integer',
            'id_pekerjaan' => 'required|integer',
            'id_penyedia' => 'required|integer',
            'kode_rup' => 'required|string|max:255',
            'kode_paket' => 'required|string|max:255',
            'nomor_penawaran' => 'required|string|max:255',
            'tanggal_penawaran' => 'required|date',
            'nilai_kontrak' => 'required|numeric',
            'tgl_sppbj' => 'required|date',
            'tgl_spk' => 'required|date',
            'tgl_spmk' => 'required|date',
            'tgl_selesai' => 'required|date',
            'sppbj' => 'required|string|max:255',
            'spk' => 'required|string|max:255',
            'spmk' => 'required|string|max:255',
        ]);

        try {
            $kontrak = Kontrak::findOrFail($id);
            $kontrak->update($request->all());

            return redirect()->back()->with('success', 'Kontrak berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui kontrak: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kontrak $kontrak)
    {
        Log::info('Deleting kontrak', ['id' => $kontrak->id]);
        try {
            $kontrak->delete();
            Log::info('Kontrak deleted', ['id' => $kontrak->id]);
            return redirect()->back()->with('success', 'Kontrak berhasil dihapus!');
        } catch (\Exception $e) {
            Log::error('Failed to delete kontrak', ['id' => $kontrak->id, 'error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Gagal menghapus kontrak: ' . $e->getMessage());
        }
    }

    public function generateCoverPdf(Kontrak $kontrak)
    {
        $kontrak->load(['pekerjaan.kegiatan', 'penyedia']);
        $pdf = Pdf::loadView('pdf.contract_cover', compact('kontrak'));
        return $pdf->stream('cover_kontrak_' . $kontrak->nomor_penawaran . '.pdf');
    }
}
