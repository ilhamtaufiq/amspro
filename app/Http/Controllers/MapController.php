<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Kecamatan;
use App\Models\Desa;

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

        $allFeatures = collect();
        foreach ($geojsonFiles as $featureCollection) {
            if (isset($featureCollection['features'])) {
                $allFeatures = $allFeatures->merge($featureCollection['features']);
            }
        }

        $kecamatanList = Kecamatan::all()->map(function ($kecamatan) use ($allFeatures) {
            $geojsonFeature = $allFeatures->first(function ($feature) use ($kecamatan) {
                return isset($feature['properties']['district']) && strtolower(trim($feature['properties']['district'])) === strtolower(trim($kecamatan->n_kec));
            });
            return [
                'id' => $kecamatan->id,
                'name' => $kecamatan->n_kec,
                'geojson' => $geojsonFeature,
            ];
        });

        $desaList = Desa::all()->map(function ($desa) use ($allFeatures) {
            $geojsonFeature = $allFeatures->first(function ($feature) use ($desa) {
                return isset($feature['properties']['village']) && strtolower(trim($feature['properties']['village'])) === strtolower(trim($desa->n_desa));
            });
            return [
                'id' => $desa->id,
                'name' => $desa->n_desa,
                'kecamatan_id' => $desa->kecamatan_id,
                'geojson' => $geojsonFeature,
            ];
        });

        return Inertia::render('Map/Index', [
            'geojson' => $geojsonFiles,
            'kecamatanList' => $kecamatanList,
            'desaList' => $desaList,
        ]);
    }
}
