<?php

namespace App\Http\Controllers;

use App\Models\Foto;
use App\Models\Pekerjaan;
use App\Models\Penerima;
use App\Models\Output;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FotoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Pekerjaan $pekerjaan)
    {
        // This index is not typically used directly as fotos are nested under pekerjaan
        // You might redirect or return an error if accessed directly
        return redirect()->route('pekerjaan.show', $pekerjaan);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Not used as creation is handled via form on pekerjaan.show
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Pekerjaan $pekerjaan)
    {
        $request->validate([
            'photo' => 'required|image|max:5120', // Max 5MB
            'keterangan' => 'required|string|in:0%,25%,50%,75%,100%',
            'komponen_id' => 'required|exists:tbl_output,id',
            'penerima_id' => 'nullable|exists:penerimas,id',
            'koordinat' => 'required|string',
            'validasi_koordinat' => 'boolean',
            'validasi_koordinat_message' => 'nullable|string',
        ]);

        $foto = new Foto([
            'pekerjaan_id' => $pekerjaan->id,
            'keterangan' => $request->keterangan,
            'komponen_id' => $request->komponen_id,
            'penerima_id' => $request->penerima_id,
            'koordinat' => $request->koordinat,
            'validasi_koordinat' => $request->validasi_koordinat,
            'validasi_koordinat_message' => $request->validasi_koordinat_message,
        ]);
        $foto->save();

        if ($request->hasFile('photo')) {
            $foto->addMediaFromRequest('photo')->toMediaCollection('foto/pekerjaan');
        }

        return redirect()->back()->with('success', 'Foto berhasil diunggah.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Pekerjaan $pekerjaan, Foto $foto)
    {
        // Not typically used directly
        return Inertia::render('Pekerjaan/Show', [
            'pekerjaan' => $pekerjaan->load('fotos'),
            'foto' => $foto,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pekerjaan $pekerjaan, Foto $foto)
    {
        // Not used as editing is handled via form on pekerjaan.show
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pekerjaan $pekerjaan, Foto $foto)
    {
        // Not typically used
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pekerjaan $pekerjaan, Foto $foto)
    {
        Storage::disk('public')->delete($foto->photo_path);
        $foto->delete();

        return redirect()->back()->with('success', 'Foto berhasil dihapus.');
    }

    public function print(Pekerjaan $pekerjaan, Request $request)
    {
        $keteranganFilter = $request->query('keterangan');
        $komponenFilter = $request->query('komponen');

        $fotosQuery = $pekerjaan->fotos()->with(['penerima', 'output']);

        if ($keteranganFilter) {
            $fotosQuery->where('keterangan', $keteranganFilter);
        }

        if ($komponenFilter) {
            $fotosQuery->where('komponen_id', $komponenFilter);
        }

        $fotos = $fotosQuery->get();

        $groupedByPenerima = $fotos->groupBy(function ($foto) {
            return $foto->penerima_id ?? 'tanpa_penerima';
        })->map(function ($group) use ($pekerjaan) {
            $penerima = $group->first()->penerima;
            $data = [
                'nama' => $penerima->nama ?? 'N/A',
                'nik' => $penerima->nik ?? 'N/A',
                'fotos' => [
                    '0%' => null,
                    '25%' => null,
                    '50%' => null,
                    '75%' => null,
                    '100%' => null,
                ],
            ];

            foreach ($group as $foto) {
                if (in_array($foto->keterangan, ['0%', '25%', '50%', '75%', '100%'])) {
                    $data['fotos'][$foto->keterangan] = $foto->getFirstMediaUrl('foto/pekerjaan');
                }
            }
            return $data;
        })->values(); // Reset keys to be a simple array

        $komponenName = null;
        if ($komponenFilter) {
            $output = Output::find($komponenFilter);
            if ($output) {
                $komponenName = $output->komponen;
            }
        }

        return view('print.photos', [
            'pekerjaan' => $pekerjaan,
            'groupedFotos' => $groupedByPenerima,
            'keteranganFilter' => $keteranganFilter,
            'komponenFilter' => $komponenFilter,
            'komponenName' => $komponenName,
        ]);
    }

}