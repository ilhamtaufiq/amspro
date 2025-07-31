<?php

namespace App\Http\Controllers;

use App\Models\Keuangan;
use App\Models\Kontrak;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KeuanganController extends Controller
{
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