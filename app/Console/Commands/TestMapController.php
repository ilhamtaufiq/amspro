<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\MapController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class TestMapController extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'map:test {--user-id= : Test with specific user ID} {--tahun= : Test with specific year}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test MapController functionality and identify issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing MapController...');

        try {
            // Test 1: Check GeoJSON directory
            $this->testGeoJsonDirectory();

            // Test 2: Check database connections
            $this->testDatabaseConnections();

            // Test 3: Check models
            $this->testModels();

            // Test 4: Check cache
            $this->testCache();

            // Test 5: Simulate MapController
            $this->testMapController();

            $this->info('All tests completed successfully!');

        } catch (Exception $e) {
            $this->error('Test failed: ' . $e->getMessage());
            Log::error('MapController test failed', ['error' => $e->getMessage()]);
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    private function testGeoJsonDirectory()
    {
        $this->info('Testing GeoJSON directory...');
        
        $path = storage_path('app/geojson/kecamatan');
        
        if (!is_dir($path)) {
            $this->warn("Directory not found: {$path}");
            return;
        }

        $files = glob($path . '/*.geojson');
        
        if (empty($files)) {
            $this->warn("No GeoJSON files found in: {$path}");
            return;
        }

        $this->info("Found " . count($files) . " GeoJSON files");

        foreach ($files as $file) {
            if (!file_exists($file)) {
                $this->warn("File not accessible: {$file}");
                continue;
            }

            if (!is_readable($file)) {
                $this->warn("File not readable: {$file}");
                continue;
            }

            $content = file_get_contents($file);
            if ($content === false) {
                $this->warn("Cannot read file content: {$file}");
                continue;
            }

            $decoded = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->warn("Invalid JSON in file: {$file} - " . json_last_error_msg());
                continue;
            }

            $this->info("✓ Valid JSON file: " . basename($file));
        }
    }

    private function testDatabaseConnections()
    {
        $this->info('Testing database connections...');

        try {
            // Test basic database connection
            \DB::connection()->getPdo();
            $this->info('✓ Database connection successful');

            // Test table existence
            $tables = ['tbl_pekerjaan', 'tbl_kecamatan', 'tbl_desa', 'tbl_kegiatan', 'tbl_foto'];
            
            foreach ($tables as $table) {
                if (\Schema::hasTable($table)) {
                    $this->info("✓ Table exists: {$table}");
                } else {
                    $this->warn("✗ Table missing: {$table}");
                }
            }

        } catch (Exception $e) {
            $this->error('Database connection failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function testModels()
    {
        $this->info('Testing models...');

        try {
            // Test Pekerjaan model
            $pekerjaanCount = \App\Models\Pekerjaan::count();
            $this->info("✓ Pekerjaan model: {$pekerjaanCount} records");

            // Test Kecamatan model
            $kecamatanCount = \App\Models\Kecamatan::count();
            $this->info("✓ Kecamatan model: {$kecamatanCount} records");

            // Test Desa model
            $desaCount = \App\Models\Desa::count();
            $this->info("✓ Desa model: {$desaCount} records");

            // Test Kegiatan model
            $kegiatanCount = \App\Models\Kegiatan::count();
            $this->info("✓ Kegiatan model: {$kegiatanCount} records");

        } catch (Exception $e) {
            $this->error('Model test failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function testCache()
    {
        $this->info('Testing cache...');

        try {
            $testKey = 'map_test_' . time();
            $testValue = 'test_value';

            // Test cache write
            \Cache::put($testKey, $testValue, 60);
            $this->info('✓ Cache write successful');

            // Test cache read
            $retrieved = \Cache::get($testKey);
            if ($retrieved === $testValue) {
                $this->info('✓ Cache read successful');
            } else {
                $this->warn('✗ Cache read failed');
            }

            // Clean up
            \Cache::forget($testKey);

        } catch (Exception $e) {
            $this->error('Cache test failed: ' . $e->getMessage());
            throw $e;
        }
    }

    private function testMapController()
    {
        $this->info('Testing MapController simulation...');

        try {
            $userId = $this->option('user-id');
            $tahun = $this->option('tahun') ?? date('Y');

            if ($userId) {
                $user = \App\Models\User::find($userId);
                if (!$user) {
                    $this->warn("User with ID {$userId} not found");
                    return;
                }
            } else {
                $user = \App\Models\User::first();
                if (!$user) {
                    $this->warn("No users found in database");
                    return;
                }
            }

            $this->info("Testing with user: {$user->name} (ID: {$user->id})");
            $this->info("Testing with tahun: {$tahun}");

            // Simulate the main queries from MapController
            $pekerjaanQuery = \App\Models\Pekerjaan::query()
                ->whereHas('kegiatan', function ($query) use ($tahun) {
                    $query->where('tahun_anggaran', $tahun);
                });

            if (!$user->hasRole('Super Admin')) {
                $roleId = $user->roles->first()->id ?? null;
                if ($roleId) {
                    $pekerjaanQuery->whereExists(function ($subQuery) use ($roleId) {
                        $subQuery->select(\DB::raw(1))
                                 ->from('kegiatan_role')
                                 ->whereColumn('kegiatan_role.kegiatan_id', 'tbl_pekerjaan.kegiatan_id')
                                 ->where('kegiatan_role.role_id', $roleId);
                    });
                } else {
                    $pekerjaanQuery->whereRaw('1 = 0');
                }
            }

            $pekerjaanCount = $pekerjaanQuery->count();
            $this->info("✓ Pekerjaan query: {$pekerjaanCount} records found");

            // Test kecamatan query
            $kecamatanCount = \App\Models\Kecamatan::count();
            $this->info("✓ Kecamatan query: {$kecamatanCount} records found");

            // Test desa query
            $desaCount = \App\Models\Desa::count();
            $this->info("✓ Desa query: {$desaCount} records found");

            // Test pekerjaan with coordinates
            $pekerjaanWithCoords = $pekerjaanQuery
                ->whereHas('latestFotoWithCoordinates', function ($query) {
                    $query->whereNotNull('koordinat');
                })
                ->count();
            $this->info("✓ Pekerjaan with coordinates: {$pekerjaanWithCoords} records found");

        } catch (Exception $e) {
            $this->error('MapController simulation failed: ' . $e->getMessage());
            throw $e;
        }
    }
} 