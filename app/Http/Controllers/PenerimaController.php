<?php

namespace App\Http\Controllers;

use App\Models\Penerima;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PenerimaController extends Controller
{
    public function store(Request $request, Pekerjaan $pekerjaan)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jumlah_jiwa' => 'required|integer|min:0',
            'nik' => 'required|string|max:255',
            'alamat' => 'nullable|string|max:255',
        ]);

        Penerima::create([
            'pekerjaan_id' => $pekerjaan->id,
            'nama' => $validated['nama'],
            'jumlah_jiwa' => $validated['jumlah_jiwa'],
            'nik' => $validated['nik'],
            'alamat' => $validated['alamat'],
        ]);

        return redirect()->back()->with('success', 'Penerima berhasil ditambahkan.');
    }

    public function update(Request $request, Pekerjaan $pekerjaan, Penerima $penerima)
    {
        // Verify penerima belongs to pekerjaan
        if ($penerima->pekerjaan_id !== $pekerjaan->id) {
            return redirect()->back()->with('error', 'Penerima tidak terkait dengan pekerjaan ini.');
        }

        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jumlah_jiwa' => 'required|integer|min:0',
            'nik' => 'required|string|max:255',
            'alamat' => 'nullable|string|max:255',
        ]);

        try {
            $penerima->update($validated);
            return redirect()->back()->with('success', 'Penerima berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui penerima: ' . $e->getMessage());
        }
    }

    public function destroy(Pekerjaan $pekerjaan, Penerima $penerima)
    {
        // Verify penerima belongs to pekerjaan
        if ($penerima->pekerjaan_id !== $pekerjaan->id) {
            return redirect()->back()->with('error', 'Penerima tidak terkait dengan pekerjaan ini.');
        }

        try {
            $penerima->delete();
            return redirect()->back()->with('success', 'Penerima berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus penerima: ' . $e->getMessage());
        }
    }
}