<?php

namespace App\Http\Controllers;

use App\Models\Kontrak;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KontrakController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kontrak = Kontrak::with(['penyedia', 'pekerjaan'])->get();
        return Inertia::render('kontrak/index', [
            'kontrak' => $kontrak,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Not needed for this context, as the form is in PekerjaanDetail
        return redirect()->back();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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
            'sppbj' => 'required|string|max:255',
            'spk' => 'required|string|max:255',
            'spmk' => 'required|string|max:255',
        ]);

        Kontrak::create($request->all());

        return redirect()->back()->with('success', 'Kontrak berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kontrak $kontrak)
    {
        \Log::info('Showing kontrak', ['id' => $kontrak->id]);
        return Inertia::render('PekerjaanDetail', [
            'pekerjaan' => $kontrak->pekerjaan,
            'kontrak' => $kontrak,
            'penyediaList' => \App\Models\Penyedia::all(), // Fetch all penyedia for the form
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

        $kontrak = Kontrak::findOrFail($id);
        $kontrak->update($request->all());

        return redirect()->back()->with('success', 'Kontrak berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kontrak $kontrak)
    {
        \Log::info('Deleting kontrak', ['id' => $kontrak->id]);
        $kontrak->delete();
        \Log::info('Kontrak deleted', ['id' => $kontrak->id]);
        return redirect()->back()->with('success', 'Kontrak berhasil dihapus!');
    }
}
