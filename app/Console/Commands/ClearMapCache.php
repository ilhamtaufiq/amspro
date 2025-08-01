<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\Kegiatan;

class ClearMapCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'map:clear-cache {--user-id= : Clear cache for specific user} {--tahun= : Clear cache for specific year}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all map-related cache';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user-id');
        $tahun = $this->option('tahun');
        
        $clearedCount = 0;
        
        // Static cache keys
        $staticCacheKeys = ['geojson_files'];
        
        foreach ($staticCacheKeys as $key) {
            if (Cache::forget($key)) {
                $clearedCount++;
                $this->info("Cleared static cache: {$key}");
            }
        }
        
        // Dynamic cache keys with year and user ID
        if ($userId && $tahun) {
            // Clear cache for specific user and year
            $dynamicKeys = [
                "kecamatan_with_counts_{$tahun}_{$userId}",
                "desa_with_counts_{$tahun}_{$userId}",
                "pekerjaan_geojson_{$tahun}_{$userId}"
            ];
            
            foreach ($dynamicKeys as $key) {
                if (Cache::forget($key)) {
                    $clearedCount++;
                    $this->info("Cleared dynamic cache: {$key}");
                }
            }
        } else {
            // Clear all dynamic cache keys
            $this->clearAllDynamicCache();
            $clearedCount += 3; // Approximate count
        }
        
        $this->info("Successfully cleared {$clearedCount} cache items.");
        
        return Command::SUCCESS;
    }
    
    /**
     * Clear all dynamic cache keys for all users and years
     */
    private function clearAllDynamicCache()
    {
        $this->info("Clearing all dynamic cache keys...");
        
        // Get all unique years from kegiatan table
        $years = Kegiatan::distinct()->pluck('tahun_anggaran')->toArray();
        
        // Get all user IDs
        $userIds = User::pluck('id')->toArray();
        
        foreach ($years as $year) {
            foreach ($userIds as $userId) {
                $dynamicKeys = [
                    "kecamatan_with_counts_{$year}_{$userId}",
                    "desa_with_counts_{$year}_{$userId}",
                    "pekerjaan_geojson_{$year}_{$userId}"
                ];
                
                foreach ($dynamicKeys as $key) {
                    Cache::forget($key);
                }
            }
        }
        
        $this->info("Cleared dynamic cache for " . count($years) . " years and " . count($userIds) . " users");
    }
} 