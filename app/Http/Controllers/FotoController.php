<?php

namespace App\Http\Controllers;

use App\Models\Foto;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Exceptions\FileCannotBeAdded;

class FotoController extends Controller
{
    /**
     * Store a newly created photo in storage.
     */
    public function store(Request $request, Pekerjaan $pekerjaan)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,gif|max:2048',
            'keterangan' => 'required|in:0%,50%,100%',
            'komponen_id' => 'required|exists:tbl_output,id',
            'penerima_id' => 'nullable|exists:tbl_penerima,id',
            'koordinat' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $foto = Foto::create([
                'pekerjaan_id' => $pekerjaan->id,
                'komponen_id' => $request->komponen_id,
                'penerima_id' => $request->penerima_id,
                'keterangan' => $request->keterangan,
                'koordinat' => $request->koordinat,
            ]);

            if ($request->hasFile('photo')) {
                $foto->addMediaFromRequest('photo')
                     ->toMediaCollection('foto/pekerjaan');
            }

            DB::commit();

            return redirect()->back()->with('success', 'Foto berhasil diunggah.');
        } catch (FileCannotBeAdded $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['photo' => 'Gagal mengunggah foto: ' . $e->getMessage()]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['photo' => 'Terjadi kesalahan saat menyimpan foto.']);
        }
    }

    /**
     * Remove the specified photo from storage.
     */
    public function destroy(Pekerjaan $pekerjaan, Foto $foto)
    {
        if ($foto->pekerjaan_id !== $pekerjaan->id) {
            return redirect()->back()->withErrors(['photo' => 'Foto tidak valid untuk pekerjaan ini.']);
        }

        try {
            $foto->delete();
            return redirect()->back()->with('success', 'Foto berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['photo' => 'Gagal menghapus foto: ' . $e->getMessage()]);
        }
    }
}
