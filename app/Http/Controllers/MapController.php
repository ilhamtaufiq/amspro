<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class MapController extends Controller
{
    public function index()
    {
        $geojsonFiles = [];
        $path = storage_path('app/geojson/kecamatan');
        $files = glob($path . '/*.geojson');

        foreach ($files as $file) {
            $geojsonFiles[] = json_decode(file_get_contents($file), true);
        }

        return Inertia::render('Map/Index', [
            'geojson' => $geojsonFiles,
        ]);
    }
}
