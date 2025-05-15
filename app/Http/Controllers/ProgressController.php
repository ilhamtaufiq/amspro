<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\Output;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProgressController extends Controller
{
    public function index($pekerjaanId)
    {
        $progresses = Progress::with('output')->where('pekerjaan_id', $pekerjaanId)->get();
        return response()->json($progresses);
    }

    public function store(Request $request, $pekerjaanId)
    {
        $validator = Validator::make($request->all(), [
            'komponen_id' => 'required|exists:tbl_output,id',
            'realisasi_fisik' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Gagal menambahkan data progress.');
        }

        // Check if a progress record already exists for this komponen_id and pekerjaan_id
        $existingProgress = Progress::where('pekerjaan_id', $pekerjaanId)
            ->where('komponen_id', $request->komponen_id)
            ->first();

        if ($existingProgress) {
            return redirect()->back()
                ->withErrors(['komponen_id' => 'Komponen ini sudah memiliki data progress. Silakan perbarui data yang ada.'])
                ->withInput()
                ->with('error', 'Gagal menambahkan data progress.');
        }

        Progress::create([
            'pekerjaan_id' => $pekerjaanId,
            'komponen_id' => $request->komponen_id,
            'realisasi_fisik' => $request->realisasi_fisik,
        ]);

        return redirect()->back()->with('success', 'Data progress berhasil ditambahkan.');
    }

    public function update(Request $request, $pekerjaanId, Progress $progress)
    {
        $validator = Validator::make($request->all(), [
            'komponen_id' => 'required|exists:tbl_output,id',
            'realisasi_fisik' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Gagal memperbarui data progress.');
        }

        $progress->update([
            'komponen_id' => $request->komponen_id,
            'realisasi_fisik' => $request->realisasi_fisik,
        ]);

        return redirect()->back()->with('success', 'Data progress berhasil diperbarui.');
    }

    public function destroy($pekerjaanId, Progress $progress)
    {
        $progress->delete();
        return redirect()->back()->with('success', 'Data progress berhasil dihapus.');
    }
}