<?php

namespace App\Http\Controllers;

use App\Models\Penyedia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenyediaController extends Controller
{
    public function index()
    {
        \Log::info('Fetching penyedia list');
        $penyedia = Penyedia::all();
        return Inertia::render('penyedia/index', [
            'penyedia' => $penyedia,
        ]);
    }

    public function create()
    {
        \Log::info('Showing penyedia create form');
        return Inertia::render('penyedia/create');
    }

    public function store(Request $request)
    {
        \Log::info('Storing new penyedia', ['data' => $request->all()]);
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'direktur' => 'required|string|max:255',
            'no_akta' => 'required|string|max:255',
            'notaris' => 'required|string|max:255',
            'tanggal_akta' => 'nullable|date',
            'alamat' => 'required|string|max:255',
            'bank' => 'nullable|string|max:255',
            'norek' => 'nullable|string|max:255',
        ]);

        $penyedia = Penyedia::create($validated);
        \Log::info('Penyedia created', ['id' => $penyedia->id]);
        return redirect()->route('penyedia.index')->with('success', 'Penyedia created successfully.');
    }

    public function show(Penyedia $penyedia)
    {
        \Log::info('Showing penyedia', ['id' => $penyedia->id]);
        return Inertia::render('penyedia/show', [
            'penyedia' => $penyedia,
        ]);
    }

    public function edit(Penyedia $penyedia)
    {
        \Log::info('Showing penyedia edit form', ['id' => $penyedia->id]);
        return Inertia::render('penyedia/edit', [
            'penyedia' => $penyedia,
        ]);
    }

    public function update(Request $request, Penyedia $penyedia)
    {
        \Log::info('Updating penyedia', ['id' => $penyedia->id, 'data' => $request->all()]);
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'direktur' => 'required|string|max:255',
            'no_akta' => 'required|string|max:255',
            'notaris' => 'required|string|max:255',
            'tanggal_akta' => 'nullable|date',
            'alamat' => 'required|string|max:255',
            'bank' => 'nullable|string|max:255',
            'norek' => 'nullable|string|max:255',
        ]);

        $penyedia->update($validated);
        \Log::info('Penyedia updated', ['id' => $penyedia->id]);
        return redirect()->route('penyedia.index')->with('success', 'Penyedia updated successfully.');
    }

    public function destroy(Penyedia $penyedia)
    {
        \Log::info('Deleting penyedia', ['id' => $penyedia->id]);
        $penyedia->delete();
        \Log::info('Penyedia deleted', ['id' => $penyedia->id]);
        return redirect()->route('penyedia.index')->with('success', 'Penyedia deleted successfully.');
    }
}
