<?php

namespace App\Http\Controllers;

use App\Models\Keuangan;
use App\Models\Kontrak;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class KeuanganController extends Controller
{
    public function dashboard()
    {
        // Get all keuangan data for the dashboard
        $keuanganData = Keuangan::with('pekerjaan')->get();
        $kontrakData = Kontrak::all();
        
        // Transform data for the charts
        $chartData = [];
        $totalRealisasi = 0;
        $totalNilaiKontrak = 0;
        
        // Prepare monthly spending data (mock data for now)
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $monthlySpending = array_map(function($month) {
            return [
                'name' => $month,
                'realisasi' => 0
            ];
        }, $months);
        
        // Process data for charts
        foreach ($keuanganData as $keuangan) {
            $kontrak = $kontrakData->where('id_pekerjaan', $keuangan->pekerjaan_id)->first();
            $nilaiKontrak = $kontrak ? $kontrak->nilai_kontrak : 0;
            
            $chartData[] = [
                'id' => $keuangan->id,
                'pekerjaan_id' => $keuangan->pekerjaan_id,
                'pekerjaan_name' => $keuangan->pekerjaan->nama_pekerjaan ?? 'Pekerjaan ' . $keuangan->pekerjaan_id,
                'realisasi' => $keuangan->realisasi,
                'nilai_kontrak' => $nilaiKontrak,
                'sisa' => max(0, $nilaiKontrak - $keuangan->realisasi),
                'persentase' => $nilaiKontrak > 0 ? ($keuangan->realisasi / $nilaiKontrak) * 100 : 0
            ];
            
            $totalRealisasi += $keuangan->realisasi;
            $totalNilaiKontrak += $nilaiKontrak;
            
            // For demo purposes, put all realization in December
            // In a real app, you would use the actual dates from the database
            $monthlySpending[11]['realisasi'] += $keuangan->realisasi;
        }
        
        $summary = [
            'total_realisasi' => $totalRealisasi,
            'total_nilai_kontrak' => $totalNilaiKontrak,
            'total_sisa' => max(0, $totalNilaiKontrak - $totalRealisasi),
            'persentase_total' => $totalNilaiKontrak > 0 ? ($totalRealisasi / $totalNilaiKontrak) * 100 : 0
        ];
        
        return Inertia::render('Keuangan/Index', [
            'keuanganData' => $keuanganData,
            'chartData' => $chartData,
            'monthlySpending' => array_values($monthlySpending),
            'summary' => $summary
        ]);
    }
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