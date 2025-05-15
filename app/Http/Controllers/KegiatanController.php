<?php

namespace App\Http\Controllers;

use App\Models\Kegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KegiatanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $kegiatan = Kegiatan::with('pekerjaan')->get();
        return Inertia::render('kegiatan/index', [
            'kegiatan' => $kegiatan
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('kegiatan/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:225',
            'bidang' => 'required|string|max:50',
            'tahun_anggaran' => 'required|string|max:50',
        ]);

        Kegiatan::create($request->all());

        return redirect()->route('kegiatan.index')
            ->with('success', 'Kegiatan created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Kegiatan $kegiatan)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kegiatan $kegiatan)
    {
        return Inertia::render('kegiatan/edit', [
            'kegiatan' => $kegiatan
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Kegiatan $kegiatan)
    {
        $request->validate([
            'nama' => 'required|string|max:225',
            'bidang' => 'required|string|max:50',
            'tahun_anggaran' => 'required|string|max:50',
        ]);

        $kegiatan->update($request->all());

        return redirect()->route('kegiatan.index')
            ->with('success', 'Kegiatan updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Kegiatan $kegiatan)
    {
        $kegiatan->delete();
        return redirect()->route('kegiatan.index')
            ->with('success', 'Kegiatan deleted successfully.');
    }
}
