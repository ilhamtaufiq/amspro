<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Kecamatan;
use App\Models\Desa;
use App\Models\Pekerjaan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MapController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $tahun = $request->query('tahun', session('tahun', date('Y')));

        // Cache GeoJSON data for 1 hour
        $geojsonFiles = Cache::remember('geojson_files', 3600, function () {
            $geojsonFiles = [];
            $path = storage_path('app/geojson/kecamatan');
            $files = glob($path . '/*.geojson');

            foreach ($files as $file) {
                $geojsonFiles[] = json_decode(file_get_contents($file), true);
            }
            return $geojsonFiles;
        });

        $allFeatures = collect();
        foreach ($geojsonFiles as $featureCollection) {
            if (isset($featureCollection['features'])) {
                $allFeatures = $allFeatures->merge($featureCollection['features']);
            }
        }

        // Create base pekerjaan query with year filter
        $pekerjaanQuery = Pekerjaan::query()
            ->whereHas('kegiatan', function ($query) use ($tahun) {
                $query->where('tahun_anggaran', $tahun);
            });

        // Add role-based filtering (same as DashboardController)
        if (!$user->hasRole('Super Admin')) {
            $roleId = $user->roles->first()->id ?? null;
            if ($roleId) {
                $pekerjaanQuery->whereExists(function ($subQuery) use ($roleId) {
                    $subQuery->select(DB::raw(1))
                             ->from('kegiatan_role')
                             ->whereColumn('kegiatan_role.kegiatan_id', 'tbl_pekerjaan.kegiatan_id')
                             ->where('kegiatan_role.role_id', $roleId);
                });
            } else {
                $pekerjaanQuery->whereRaw('1 = 0'); // No role, no data
            }
        }

        // Optimize database queries with eager loading and aggregation
        $kecamatanWithCounts = Cache::remember("kecamatan_with_counts_{$tahun}_{$user->id}", 1800, function () use ($pekerjaanQuery) {
            return Kecamatan::select('id', 'n_kec')
                ->withCount(['pekerjaan as pekerjaan_count' => function ($query) use ($pekerjaanQuery) {
                    $query->whereIn('id', $pekerjaanQuery->pluck('id'));
                }])
                ->get();
        });

        $desaWithCounts = Cache::remember("desa_with_counts_{$tahun}_{$user->id}", 1800, function () use ($pekerjaanQuery) {
            return Desa::select('id', 'n_desa', 'kecamatan_id')
                ->withCount(['pekerjaan as pekerjaan_count' => function ($query) use ($pekerjaanQuery) {
                    $query->whereIn('id', $pekerjaanQuery->pluck('id'));
                }])
                ->get();
        });

        // Create lookup maps for faster matching
        $featureMap = $this->createFeatureMap($allFeatures);

        $kecamatanList = $kecamatanWithCounts->map(function ($kecamatan) use ($featureMap) {
            $geojsonFeature = $featureMap['kecamatan'][strtolower(trim($kecamatan->n_kec))] ?? null;

            return [
                'id' => $kecamatan->id,
                'name' => $kecamatan->n_kec,
                'geojson' => $geojsonFeature,
                'pekerjaan_count' => $kecamatan->pekerjaan_count,
            ];
        });

        $desaList = $desaWithCounts->map(function ($desa) use ($featureMap) {
            $geojsonFeature = $featureMap['desa'][strtolower(trim($desa->n_desa))] ?? null;
            
            return [
                'id' => $desa->id,
                'name' => $desa->n_desa,
                'kecamatan_id' => $desa->kecamatan_id,
                'geojson' => $geojsonFeature,
                'pekerjaan_count' => $desa->pekerjaan_count,
            ];
        });

        // Only load pekerjaan with coordinates when needed (with year filter)
        $pekerjaanGeojson = Cache::remember("pekerjaan_geojson_{$tahun}_{$user->id}", 900, function () use ($pekerjaanQuery) {
            return (clone $pekerjaanQuery)
                ->with(['kecamatan', 'desa', 'latestFotoWithCoordinates'])
                ->whereHas('latestFotoWithCoordinates', function ($query) {
                    $query->whereNotNull('koordinat');
                })
                ->get()
                ->map(function ($pekerjaan) {
                    $coordinates = null;
                    if ($pekerjaan->latestFotoWithCoordinates && $pekerjaan->latestFotoWithCoordinates->koordinat) {
                        $coords = explode(',', $pekerjaan->latestFotoWithCoordinates->koordinat);
                        if (count($coords) === 2) {
                            $coordinates = [(float)$coords[1], (float)$coords[0]]; // GeoJSON is [lng, lat]
                        }
                    }

                    return [
                        'type' => 'Feature',
                        'geometry' => [
                            'type' => 'Point',
                            'coordinates' => $coordinates,
                        ],
                        'properties' => [
                            'id' => $pekerjaan->id,
                            'nama_paket' => $pekerjaan->nama_paket,
                            'pagu' => $pekerjaan->pagu,
                            'kecamatan_id' => $pekerjaan->kecamatan_id,
                            'desa_id' => $pekerjaan->desa_id,
                            'kecamatan' => $pekerjaan->kecamatan->n_kec ?? null,
                            'desa' => $pekerjaan->desa->n_desa ?? null,
                            'koordinat' => $pekerjaan->latestFotoWithCoordinates->koordinat ?? null,
                        ],
                    ];
                })->filter(function ($feature) {
                    return $feature['geometry']['coordinates'] !== null;
                })->values();
        });

        return Inertia::render('Map/Index', [
            'geojson' => $geojsonFiles,
            'kecamatanList' => $kecamatanList,
            'desaList' => $desaList,
            'pekerjaanGeojson' => $pekerjaanGeojson,
            'tahun_aktif' => (int) $tahun,
            'isSuperAdmin' => $user->hasRole('Super Admin'),
        ]);
    }

    /**
     * Create lookup maps for faster feature matching
     */
    private function createFeatureMap($allFeatures)
    {
        $featureMap = [
            'kecamatan' => [],
            'desa' => []
        ];

        foreach ($allFeatures as $feature) {
            if (isset($feature['properties'])) {
                $props = $feature['properties'];
                
                if (isset($props['district'])) {
                    $key = strtolower(trim($props['district']));
                    $featureMap['kecamatan'][$key] = $feature;
                }
                
                if (isset($props['village'])) {
                    $key = strtolower(trim($props['village']));
                    $featureMap['desa'][$key] = $feature;
                }
            }
        }

        return $featureMap;
    }
}
