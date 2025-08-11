<?php

namespace App\Http\Controllers;

use App\Models\Foto;
use App\Models\Pekerjaan;
use App\Models\Penerima;
use App\Models\Output;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
        $validated = $request->validate([
            'photo' => 'required|image|max:5120', // Max 5MB
            'keterangan' => 'required|string|in:0%,25%,50%,75%,100%',
            'komponen_id' => 'required|exists:tbl_output,id',
            'penerima_id' => 'nullable|exists:tbl_penerima,id',
            'koordinat' => 'required|string',
            'validasi_koordinat' => 'boolean',
            'validasi_koordinat_message' => 'nullable|string',
        ]);

        $foto = new Foto($validated);
        $foto->pekerjaan_id = $pekerjaan->id;
        $foto->save();

        if ($request->hasFile('photo')) {
            $foto->addMediaFromRequest('photo')
                 ->usingFileName(Str::random(40) . '.' . $request->file('photo')->getClientOriginalExtension())
                 ->toMediaCollection('foto/pekerjaan');
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
        $validated = $request->validate([
            'photo' => 'sometimes|image|max:5120', // Max 5MB, optional
            'keterangan' => 'required|string|in:0%,25%,50%,75%,100%',
            'komponen_id' => 'required|exists:tbl_output,id',
            'penerima_id' => 'nullable|exists:tbl_penerima,id',
            'koordinat' => 'required|string',
            'validasi_koordinat' => 'boolean',
            'validasi_koordinat_message' => 'nullable|string',
        ]);

        $output = Output::find($validated['komponen_id']);
        if ($output && !$output->penerima_is_optional && empty($validated['penerima_id'])) {
            return back()->withErrors(['penerima_id' => 'Penerima harus dipilih untuk komponen ini.'])->withInput();
        }

        $foto->update($validated);

        if ($request->hasFile('photo')) {
            $foto->clearMediaCollection('foto/pekerjaan');
            $foto->addMediaFromRequest('photo')
                 ->usingFileName(Str::random(40) . '.' . $request->file('photo')->getClientOriginalExtension())
                 ->toMediaCollection('foto/pekerjaan');
        }

        return redirect()->back()->with('success', 'Foto berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pekerjaan $pekerjaan, Foto $foto)
    {
        // Delete all media associated with this foto
        $foto->clearMediaCollection('foto/pekerjaan');
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
                    $media = $foto->getFirstMedia('foto/pekerjaan');
                    $photo_base64 = null;
                    if ($media) {
                        $path = $media->getPath();
                        if (file_exists($path)) {
                            $type = pathinfo($path, PATHINFO_EXTENSION);
                            $file_content = file_get_contents($path);
                            $photo_base64 = 'data:image/' . $type . ';base64,' . base64_encode($file_content);
                        }
                    }
                    $data['fotos'][$foto->keterangan] = $photo_base64;
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