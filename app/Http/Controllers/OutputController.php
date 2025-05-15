<?php

namespace App\Http\Controllers;

use App\Models\Output;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OutputController extends Controller
{
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

        $pekerjaan = Pekerjaan::findOrFail($pekerjaanId);

        Output::create([
            'pekerjaan_id' => $pekerjaanId,
            'komponen' => $validated['komponen'],
            'satuan' => $validated['satuan'],
            'volume' => $validated['volume'],
        ]);

        return redirect()->route('pekerjaan.show', $pekerjaanId)
            ->with('success', 'Output berhasil ditambahkan');
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

        $output->update([
            'komponen' => $validated['komponen'],
            'satuan' => $validated['satuan'],
            'volume' => $validated['volume'],
        ]);

        return redirect()->route('pekerjaan.show', $pekerjaanId)
            ->with('success', 'Output berhasil diperbarui');
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

        $output->delete();

        return redirect()->route('pekerjaan.show', $pekerjaanId)
            ->with('success', 'Output berhasil dihapus');
    }
}