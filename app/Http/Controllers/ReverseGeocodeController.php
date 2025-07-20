<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Brick\Geo\Point;
use Brick\Geo\Polygon;
use Brick\Geo\MultiPolygon;
use Brick\Geo\Io\GeoJsonReader;
use Illuminate\Support\Facades\Log;

class ReverseGeocodeController extends Controller
{
    private function pointInPolygon($point, $polygonCoords)
    {
        $x = $point->x();
        $y = $point->y();
        $inside = false;
        $n = count($polygonCoords);

        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            $xi = $polygonCoords[$i][0];
            $yi = $polygonCoords[$i][1];
            $xj = $polygonCoords[$j][0];
            $yj = $polygonCoords[$j][1];

            $intersect = (($yi > $y) != ($yj > $y))
                && ($x < ($xj - $xi) * ($y - $yi) / (($yj - $yi) ?: 1e-12) + $xi);
            if ($intersect) $inside = !$inside;
        }
        return $inside;
    }

    public function reverseGeocode(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lon' => 'required|numeric',
        ]);

        $lat = $request->input('lat');
        $lon = $request->input('lon');

        $point = Point::xy($lon, $lat);

        $bboxCachePath = storage_path('app/geojson/bbox_cache.json');
        if (!file_exists($bboxCachePath)) {
            Log::error('GeoJSON bounding box cache not found.', ['path' => $bboxCachePath]);
            return response()->json(['error' => 'GeoJSON bounding box cache not found.'], 500);
        }

        $bboxCache = json_decode(file_get_contents($bboxCachePath), true);

        $foundDesa = null;
        $foundKecamatan = null;

        Log::info('Reverse geocode request received.', ['lat' => $lat, 'lon' => $lon]);

        foreach ($bboxCache as $entry) {
            [$minLon, $minLat, $maxLon, $maxLat] = $entry['bbox'];
            $fileName = $entry['file'];

            Log::info("Checking bbox for file: {$fileName}", ['bbox' => $entry['bbox']]);

            // Quick check if point is within the bounding box
            if ($lon >= $minLon && $lon <= $maxLon && $lat >= $minLat && $lat <= $maxLat) {
                Log::info("Point is within bbox for file: {$fileName}");
                $geojsonFilePath = storage_path('app/geojson/kecamatan/' . $fileName);

                if (!file_exists($geojsonFilePath)) {
                    Log::warning("GeoJSON file not found: {$geojsonFilePath}");
                    continue; // Skip if file not found
                }

                $geojsonContent = file_get_contents($geojsonFilePath);
                $geojson = json_decode($geojsonContent, true);

                if (!isset($geojson['features'])) {
                    Log::warning("Invalid GeoJSON format (missing features) in file: {$geojsonFilePath}");
                    continue; // Skip invalid GeoJSON
                }

                foreach ($geojson['features'] as $feature) {
                    if (!isset($feature['geometry']['coordinates']) || !isset($feature['geometry']['type'])) {
                        Log::warning("Feature missing geometry coordinates or type in file: {$geojsonFilePath}", ['feature' => $feature]);
                        continue;
                    }

                    try {
                        $geometry = (new GeoJsonReader())->read(json_encode($feature['geometry']));

                        $contains = false;
                        if ($geometry instanceof \Brick\Geo\Polygon) {
                            Log::info("Processing Polygon geometry.");
                            $rings = $geometry->rings();
                            $exterior = $rings[0]->toArray();
                            $inside = $this->pointInPolygon($point, $exterior);

                            // Check holes (interior rings)
                            if ($inside && count($rings) > 1) {
                                for ($i = 1; $i < count($rings); $i++) {
                                    $hole = $rings[$i]->toArray();
                                    if ($this->pointInPolygon($point, $hole)) {
                                        $inside = false;
                                        break;
                                    }
                                }
                            }
                            $contains = $inside;
                            if ($contains) {
                                Log::info('Point is inside polygon.', ['file' => $fileName, 'properties' => $feature['properties']]);
                            }
                        } elseif ($geometry instanceof \Brick\Geo\MultiPolygon) {
                            Log::info("Processing MultiPolygon geometry.");
                            foreach ($geometry->geometries() as $polygon) {
                                $rings = $polygon->rings();
                                $exterior = $rings[0]->toArray();
                                $inside = $this->pointInPolygon($point, $exterior);

                                if ($inside && count($rings) > 1) {
                                    for ($i = 1; $i < count($rings); $i++) {
                                        $hole = $rings[$i]->toArray();
                                        if ($this->pointInPolygon($point, $hole)) {
                                            $inside = false;
                                            break;
                                        }
                                    }
                                }
                                if ($inside) {
                                    $contains = true;
                                    Log::info('Point is inside multipolygon.', ['file' => $fileName, 'properties' => $feature['properties']]);
                                    break;
                                }
                            }
                        } else {
                            Log::warning("Unsupported geometry type encountered.", ['type' => get_class($geometry)]);
                        }

                        if ($contains) {
                            // Found the polygon, extract properties
                            $properties = $feature['properties'];
                            $foundDesa = $properties['nama'] ?? $properties['n_desa'] ?? $properties['village'] ?? null;
                            $foundKecamatan = $properties['kecamatan'] ?? $properties['n_kec'] ?? $properties['district'] ?? null;
                            
                            Log::info("Location found.", ['desa' => $foundDesa, 'kecamatan' => $foundKecamatan]);
                            // If both are found, we can stop searching
                            if ($foundDesa && $foundKecamatan) {
                                break 2; // Break out of both loops
                            }
                        }
                    } catch (\Exception $e) {
                        // Log error if geometry parsing fails for a feature
                        Log::error("Error parsing GeoJSON feature: " . $e->getMessage(), ['file' => $geojsonFilePath, 'feature' => $feature]);
                        continue;
                    }
                }
            }
        }

        Log::info("Reverse geocode finished.", ['foundDesa' => $foundDesa, 'foundKecamatan' => $foundKecamatan]);
        return response()->json([
            'desa' => $foundDesa,
            'kecamatan' => $foundKecamatan,
        ]);
    }
}
