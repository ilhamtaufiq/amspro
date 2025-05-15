<?php

namespace App\Http\Controllers;

use App\Models\Berkas;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BerkasController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware(['auth', 'permission:create berkas'])->only(['store']);
    //     $this->middleware(['auth', 'permission:delete berkas'])->only(['destroy']);
    // }

    public function store(Request $request, $pekerjaanId)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:2048',
            'jenis_dokumen' => 'required|string|max:255',
        ]);

        $pekerjaan = Pekerjaan::findOrFail($pekerjaanId);

        $berkas = Berkas::create([
            'pekerjaan_id' => $pekerjaan->id,
            'jenis_dokumen' => $request->jenis_dokumen,
        ]);

        if ($request->hasFile('file')) {
            $berkas->addMediaFromRequest('file')
                   ->toMediaCollection('berkas/dokumen');
        }

        return redirect()->back()->with('success', 'Dokumen berhasil diunggah.');
    }

    public function destroy($pekerjaanId, $berkasId)
    {
        $berkas = Berkas::where('pekerjaan_id', $pekerjaanId)->findOrFail($berkasId);
        $berkas->clearMediaCollection('berkas/dokumen');
        $berkas->delete();

        return redirect()->back()->with('success', 'Dokumen berhasil dihapus.');
    }
}