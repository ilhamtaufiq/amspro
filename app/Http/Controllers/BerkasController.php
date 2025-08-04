<?php

namespace App\Http\Controllers;

use App\Models\Berkas;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

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
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:10240',
            'jenis_dokumen' => 'required|string|max:255',
        ]);

        try {
            $pekerjaan = Pekerjaan::findOrFail($pekerjaanId);

            $berkas = Berkas::create([
                'pekerjaan_id' => $pekerjaan->id,
                'jenis_dokumen' => $request->jenis_dokumen,
            ]);

            if ($request->hasFile('file')) {
                $berkas->addMediaFromRequest('file')
                       ->usingFileName(Str::random(40) . '.' . $request->file('file')->getClientOriginalExtension())
                       ->toMediaCollection('berkas/dokumen');
            }

            return redirect()->back()->with('success', 'Dokumen berhasil diunggah.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengunggah dokumen: ' . $e->getMessage());
        }
    }

    public function download($pekerjaanId, $berkasId)
    {
        $berkas = Berkas::where('pekerjaan_id', $pekerjaanId)->findOrFail($berkasId);

        if ($berkas->hasMedia('berkas/dokumen')) {
            return $berkas->getFirstMedia('berkas/dokumen');
        }

        return redirect()->back()->withErrors(['file' => 'Dokumen tidak ditemukan.']);
    }

    public function destroy($pekerjaanId, $berkasId)
    {
        try {
            $berkas = Berkas::where('pekerjaan_id', $pekerjaanId)->findOrFail($berkasId);
            $berkas->clearMediaCollection('berkas/dokumen');
            $berkas->delete();

            return redirect()->back()->with('success', 'Dokumen berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus dokumen: ' . $e->getMessage());
        }
    }
}