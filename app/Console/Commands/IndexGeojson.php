<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class IndexGeojson extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'geojson:index';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a bounding box index for all kecamatan GeoJSON files.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to index GeoJSON files...');

        $path = storage_path('app/geojson/kecamatan');
        $files = glob($path . '/*.geojson');
        $index = [];

        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);

            if (!isset($data['features'])) {
                $this->warn("Skipping invalid GeoJSON file (missing 'features'): " . basename($file));
                continue;
            }

            $minLon = 180;
            $maxLon = -180;
            $minLat = 90;
            $maxLat = -90;

            foreach ($data['features'] as $feature) {
                if (!isset($feature['geometry']['coordinates'])) continue;

                // This handles both Polygon and MultiPolygon
                $polygons = $feature['geometry']['type'] === 'Polygon' 
                    ? [$feature['geometry']['coordinates']] 
                    : $feature['geometry']['coordinates'];

                foreach ($polygons as $polygon) {
                    // For MultiPolygon, there's an extra level of nesting
                    $rings = $feature['geometry']['type'] === 'MultiPolygon' ? $polygon : [$polygon];
                    foreach($rings as $ring) {
                        foreach ($ring as $coordinate) {
                            $lon = $coordinate[0];
                            $lat = $coordinate[1];

                            if ($lon < $minLon) $minLon = $lon;
                            if ($lon > $maxLon) $maxLon = $lon;
                            if ($lat < $minLat) $minLat = $lat;
                            if ($lat > $maxLat) $maxLat = $lat;
                        }
                    }
                }
            }

            $index[] = [
                'file' => basename($file),
                'bbox' => [$minLon, $minLat, $maxLon, $maxLat]
            ];

            $this->line('Indexed: ' . basename($file));
        }

        $cachePath = storage_path('app/geojson/bbox_cache.json');
        file_put_contents($cachePath, json_encode($index, JSON_PRETTY_PRINT));

        $this->info('Successfully created bounding box index at: ' . $cachePath);

        return 0;
    }
}
