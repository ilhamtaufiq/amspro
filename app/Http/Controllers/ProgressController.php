<?php

namespace App\Http\Controllers;

use App\Models\Progress;
use App\Models\Output;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ProgressController extends Controller
{
    public function dashboard()
    {
        // Get all progress data for the dashboard
        $progressData = Progress::with('output', 'pekerjaan')->get();
        
        // Transform data for the charts
        $chartData = [];
        
        // Group by pekerjaan for better visualization
        $progressByPekerjaan = $progressData->groupBy('pekerjaan_id');
        
        foreach ($progressByPekerjaan as $pekerjaanId => $items) {
            $pekerjaan = $items->first()->pekerjaan;
            if ($pekerjaan) {
                $chartData[] = [
                    'id' => $pekerjaanId,
                    'name' => $pekerjaan->nama_pekerjaan ?? 'Pekerjaan ' . $pekerjaanId,
                    'realisasi' => $items->avg('realisasi_fisik'),
                    'target' => 100,
                ];
            }
        }
        
        return Inertia::render('Progress/Index', [
            'progressData' => $progressData,
            'chartData' => $chartData,
        ]);
    }
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

        try {
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
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menambahkan data progress: ' . $e->getMessage());
        }
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

        try {
            $progress->update([
                'komponen_id' => $request->komponen_id,
                'realisasi_fisik' => $request->realisasi_fisik,
            ]);

            return redirect()->back()->with('success', 'Data progress berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat memperbarui data progress: ' . $e->getMessage());
        }
    }

    public function destroy($pekerjaanId, Progress $progress)
    {
        try {
            $progress->delete();
            return redirect()->back()->with('success', 'Data progress berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus data progress: ' . $e->getMessage());
        }
    }
}