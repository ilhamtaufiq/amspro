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
use Illuminate\Support\Facades\Log;
use Exception;

class MapController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                Log::error('MapController: User not authenticated');
                return redirect()->route('login');
            }

            $tahun = $request->query('tahun', session('tahun', date('Y')));
            Log::info('MapController: Loading map data', ['tahun' => $tahun, 'user_id' => $user->id]);

            // Cache GeoJSON data for 1 hour with error handling
            $geojsonFiles = Cache::remember('geojson_files', 3600, function () {
                try {
                    $geojsonFiles = [];
                    $path = storage_path('app/geojson/kecamatan');
                    
                    // Check if directory exists
                    if (!is_dir($path)) {
                        Log::warning('MapController: GeoJSON directory not found', ['path' => $path]);
                        return [];
                    }
                    
                    $files = glob($path . '/*.geojson');
                    
                    if (empty($files)) {
                        Log::warning('MapController: No GeoJSON files found', ['path' => $path]);
                        return [];
                    }

                    foreach ($files as $file) {
                        if (file_exists($file) && is_readable($file)) {
                            $content = file_get_contents($file);
                            if ($content !== false) {
                                $decoded = json_decode($content, true);
                                if (json_last_error() === JSON_ERROR_NONE) {
                                    $geojsonFiles[] = $decoded;
                                } else {
                                    Log::warning('MapController: Invalid JSON in file', ['file' => $file, 'error' => json_last_error_msg()]);
                                }
                            } else {
                                Log::warning('MapController: Cannot read file', ['file' => $file]);
                            }
                        } else {
                            Log::warning('MapController: File not accessible', ['file' => $file]);
                        }
                    }
                    
                    Log::info('MapController: Loaded GeoJSON files', ['count' => count($geojsonFiles)]);
                    return $geojsonFiles;
                } catch (Exception $e) {
                    Log::error('MapController: Error loading GeoJSON files', ['error' => $e->getMessage()]);
                    return [];
                }
            });

            $allFeatures = collect();
            foreach ($geojsonFiles as $featureCollection) {
                if (isset($featureCollection['features']) && is_array($featureCollection['features'])) {
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

            // Get pekerjaan IDs for filtering
            $pekerjaanIds = $pekerjaanQuery->pluck('id')->toArray();
            Log::info('MapController: Found pekerjaan IDs', ['count' => count($pekerjaanIds)]);

            // Optimize database queries with eager loading and aggregation
            $kecamatanWithCounts = Cache::remember("kecamatan_with_counts_{$tahun}_{$user->id}", 1800, function () use ($pekerjaanIds) {
                try {
                    return Kecamatan::select('id', 'n_kec')
                        ->withCount(['pekerjaan as pekerjaan_count' => function ($query) use ($pekerjaanIds) {
                            if (!empty($pekerjaanIds)) {
                                $query->whereIn('id', $pekerjaanIds);
                            } else {
                                $query->whereRaw('1 = 0');
                            }
                        }])
                        ->get();
                } catch (Exception $e) {
                    Log::error('MapController: Error loading kecamatan data', ['error' => $e->getMessage()]);
                    return collect();
                }
            });

            $desaWithCounts = Cache::remember("desa_with_counts_{$tahun}_{$user->id}", 1800, function () use ($pekerjaanIds) {
                try {
                    return Desa::select('id', 'n_desa', 'kecamatan_id')
                        ->withCount(['pekerjaan as pekerjaan_count' => function ($query) use ($pekerjaanIds) {
                            if (!empty($pekerjaanIds)) {
                                $query->whereIn('id', $pekerjaanIds);
                            } else {
                                $query->whereRaw('1 = 0');
                            }
                        }])
                        ->get();
                } catch (Exception $e) {
                    Log::error('MapController: Error loading desa data', ['error' => $e->getMessage()]);
                    return collect();
                }
            });

            // Create lookup maps for faster matching
            $featureMap = $this->createFeatureMap($allFeatures);

            $kecamatanList = $kecamatanWithCounts->map(function ($kecamatan) use ($featureMap) {
                $geojsonFeature = $featureMap['kecamatan'][strtolower(trim($kecamatan->n_kec))] ?? null;

                return [
                    'id' => $kecamatan->id,
                    'name' => $kecamatan->n_kec,
                    'geojson' => $geojsonFeature,
                    'pekerjaan_count' => $kecamatan->pekerjaan_count ?? 0,
                ];
            });

            $desaList = $desaWithCounts->map(function ($desa) use ($featureMap) {
                $geojsonFeature = $featureMap['desa'][strtolower(trim($desa->n_desa))] ?? null;
                
                return [
                    'id' => $desa->id,
                    'name' => $desa->n_desa,
                    'kecamatan_id' => $desa->kecamatan_id,
                    'geojson' => $geojsonFeature,
                    'pekerjaan_count' => $desa->pekerjaan_count ?? 0,
                ];
            });

            // Only load pekerjaan with coordinates when needed (with year filter)
            $pekerjaanGeojson = Cache::remember("pekerjaan_geojson_{$tahun}_{$user->id}", 900, function () use ($pekerjaanQuery) {
                try {
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
                } catch (Exception $e) {
                    Log::error('MapController: Error loading pekerjaan GeoJSON', ['error' => $e->getMessage()]);
                    return collect();
                }
            });

            Log::info('MapController: Successfully loaded all data', [
                'geojson_count' => count($geojsonFiles),
                'kecamatan_count' => $kecamatanList->count(),
                'desa_count' => $desaList->count(),
                'pekerjaan_count' => $pekerjaanGeojson->count()
            ]);

            return Inertia::render('Map/Index', [
                'geojson' => $geojsonFiles,
                'kecamatanList' => $kecamatanList,
                'desaList' => $desaList,
                'pekerjaanGeojson' => $pekerjaanGeojson,
                'tahun_aktif' => (int) $tahun,
                'isSuperAdmin' => $user->hasRole('Super Admin'),
            ]);

        } catch (Exception $e) {
            Log::error('MapController: Critical error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id ?? 'unknown',
                'tahun' => $tahun ?? 'unknown'
            ]);

            // Return a fallback response instead of throwing
            return Inertia::render('Map/Index', [
                'geojson' => [],
                'kecamatanList' => [],
                'desaList' => [],
                'pekerjaanGeojson' => [],
                'tahun_aktif' => (int) ($tahun ?? date('Y')),
                'isSuperAdmin' => $user->hasRole('Super Admin') ?? false,
                'error' => 'Terjadi kesalahan saat memuat data peta. Silakan coba lagi.'
            ]);
        }
    }

    /**
     * Create lookup maps for faster feature matching
     */
    private function createFeatureMap($allFeatures)
    {
        try {
            $featureMap = [
                'kecamatan' => [],
                'desa' => []
            ];

            foreach ($allFeatures as $feature) {
                if (isset($feature['properties']) && is_array($feature['properties'])) {
                    $props = $feature['properties'];
                    
                    if (isset($props['district']) && is_string($props['district'])) {
                        $key = strtolower(trim($props['district']));
                        $featureMap['kecamatan'][$key] = $feature;
                    }
                    
                    if (isset($props['village']) && is_string($props['village'])) {
                        $key = strtolower(trim($props['village']));
                        $featureMap['desa'][$key] = $feature;
                    }
                }
            }

            return $featureMap;
        } catch (Exception $e) {
            Log::error('MapController: Error creating feature map', ['error' => $e->getMessage()]);
            return ['kecamatan' => [], 'desa' => []];
        }
    }
}
