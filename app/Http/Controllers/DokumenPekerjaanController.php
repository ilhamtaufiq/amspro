<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Http\Request as HttpRequest;
use Inertia\Inertia;
use App\Models\Pekerjaan;

class DokumenPekerjaanController extends Controller
{
    public function index(HttpRequest $request)
    {
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);

        $query = Pekerjaan::with(['berkas', 'kecamatan', 'desa'])
            ->whereHas('berkas'); // Only get pekerjaan that have berkas

        if ($search) {
            $query->where('nama_paket', 'like', '%' . $search . '%')
                  ->orWhereHas('kecamatan', function ($q) use ($search) {
                      $q->where('n_kec', 'like', '%' . $search . '%');
                  })
                  ->orWhereHas('desa', function ($q) use ($search) {
                      $q->where('n_desa', 'like', '%' . $search . '%');
                  });
        }

        $pekerjaan = $query->paginate($perPage)->withQueryString();

        return Inertia::render('DokumenPekerjaan/Index', [
            'pekerjaan' => $pekerjaan->items(),
            'meta' => [
                'current_page' => $pekerjaan->currentPage(),
                'last_page' => $pekerjaan->lastPage(),
                'from' => $pekerjaan->firstItem(),
                'to' => $pekerjaan->lastItem(),
                'total' => $pekerjaan->total(),
                'per_page' => $pekerjaan->perPage(),
                'links' => collect($pekerjaan->linkCollection())->map(function ($link) {
                    return [
                        'url' => $link['url'],
                        'label' => strip_tags($link['label']),
                        'active' => $link['active'],
                    ];
                }),
            ],
            'search' => $search,
        ]);
    }
}
