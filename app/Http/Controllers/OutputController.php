<?php

namespace App\Http\Controllers;

use App\Models\Output;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OutputController extends Controller
{
    /**
     * Display the dashboard page for outputs
     */
    public function dashboard()
    {
        // Get all output data for the dashboard
        $outputData = Output::with('pekerjaan')->get();
        
        // Transform data for charts
        $barChartData = [];
        
        // Group by satuan for pie chart
        $outputBySatuan = [];
        $satuanCounts = [];
        
        foreach ($outputData as $output) {
            // Prepare data for bar chart
            $barChartData[] = [
                'id' => $output->id,
                'name' => $output->komponen,
                'volume' => $output->volume,
                'satuan' => $output->satuan,
                'pekerjaan_name' => $output->pekerjaan->nama_pekerjaan ?? 'Pekerjaan ' . $output->pekerjaan_id
            ];
            
            // Count satuan for pie chart
            if (!isset($satuanCounts[$output->satuan])) {
                $satuanCounts[$output->satuan] = 0;
            }
            $satuanCounts[$output->satuan]++;
        }
        
        // Convert satuan counts to array for pie chart
        foreach ($satuanCounts as $satuan => $count) {
            $outputBySatuan[] = [
                'satuan' => $satuan,
                'count' => $count
            ];
        }
        
        // Calculate summary data
        $summary = [
            'total_komponen' => count($outputData),
            'total_satuan' => count($outputBySatuan),
            'total_volume' => $outputData->sum('volume')
        ];
        
        return Inertia::render('Output/Index', [
            'outputData' => $outputData,
            'barChartData' => $barChartData,
            'outputBySatuan' => $outputBySatuan,
            'summary' => $summary
        ]);
    }
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

        try {
            $pekerjaan = Pekerjaan::findOrFail($pekerjaanId);

            Output::create([
                'pekerjaan_id' => $pekerjaanId,
                'komponen' => $validated['komponen'],
                'satuan' => $validated['satuan'],
                'volume' => $validated['volume'],
            ]);

            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('success', 'Output berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menambahkan output: ' . $e->getMessage());
        }
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

        try {
            $output->update([
                'komponen' => $validated['komponen'],
                'satuan' => $validated['satuan'],
                'volume' => $validated['volume'],
            ]);

            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('success', 'Output berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui output: ' . $e->getMessage());
        }
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

        try {
            $output->delete();

            return redirect()->route('pekerjaan.show', $pekerjaanId)
                ->with('success', 'Output berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus output: ' . $e->getMessage());
        }
    }
}