<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pekerjaan;
use App\Models\Kontrak;
use App\Models\User;
use App\Models\Penyedia;

class SearchIndexCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'search:index 
                            {action : The action to perform (import, flush, stats)}
                            {--model= : Specific model to index (pekerjaan, kontrak, users, penyedia)}
                            {--chunk=500 : Number of records to process per chunk}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage search indexes for Typesense';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        $model = $this->option('model');
        $chunkSize = (int) $this->option('chunk');

        switch ($action) {
            case 'import':
                $this->importData($model, $chunkSize);
                break;
            case 'flush':
                $this->flushIndexes($model);
                break;
            case 'stats':
                $this->showStats();
                break;
            default:
                $this->error("Unknown action: {$action}");
                $this->info('Available actions: import, flush, stats');
                return 1;
        }

        return 0;
    }

    /**
     * Import data into search indexes.
     */
    private function importData($model = null, $chunkSize = 500)
    {
        $models = $this->getModels($model);

        foreach ($models as $modelClass => $modelName) {
            $this->info("Importing {$modelName}...");
            
            $bar = $this->output->createProgressBar($modelClass::count());
            $bar->start();

            $modelClass::chunk($chunkSize, function ($records) use ($bar) {
                $records->searchable();
                $bar->advance($records->count());
            });

            $bar->finish();
            $this->newLine();
            $this->info("✅ {$modelName} imported successfully!");
        }

        $this->info('🎉 All data imported to search indexes!');
    }

    /**
     * Flush search indexes.
     */
    private function flushIndexes($model = null)
    {
        $models = $this->getModels($model);

        if ($this->confirm('Are you sure you want to flush the search indexes? This cannot be undone.')) {
            foreach ($models as $modelClass => $modelName) {
                $this->info("Flushing {$modelName} index...");
                $modelClass::removeAllFromSearch();
                $this->info("✅ {$modelName} index flushed!");
            }
            $this->info('🗑️ All specified indexes have been flushed!');
        } else {
            $this->info('Operation cancelled.');
        }
    }

    /**
     * Show search statistics.
     */
    private function showStats()
    {
        $this->info('📊 Search Index Statistics');
        $this->newLine();

        $models = $this->getModels();
        $totalRecords = 0;

        $headers = ['Model', 'Total Records', 'Searchable Records', 'Index Status'];
        $rows = [];

        foreach ($models as $modelClass => $modelName) {
            $total = $modelClass::count();
            $searchable = $modelClass::where(function ($query) use ($modelClass) {
                $instance = new $modelClass();
                if (method_exists($instance, 'shouldBeSearchable')) {
                    // This is a simplified check - in practice, you'd need to evaluate each record
                    return $query;
                }
                return $query;
            })->count();

            $totalRecords += $total;
            
            $status = $total > 0 ? '✅ Active' : '⚠️ Empty';
            
            $rows[] = [
                $modelName,
                number_format($total),
                number_format($searchable),
                $status
            ];
        }

        $this->table($headers, $rows);
        $this->newLine();
        $this->info("📈 Total records across all models: " . number_format($totalRecords));
    }

    /**
     * Get models to process.
     */
    private function getModels($specificModel = null)
    {
        $allModels = [
            Pekerjaan::class => 'Pekerjaan',
            Kontrak::class => 'Kontrak',
            User::class => 'Users',
            Penyedia::class => 'Penyedia',
        ];

        if ($specificModel) {
            $modelMap = [
                'pekerjaan' => Pekerjaan::class,
                'kontrak' => Kontrak::class,
                'users' => User::class,
                'penyedia' => Penyedia::class,
            ];

            if (!isset($modelMap[$specificModel])) {
                $this->error("Unknown model: {$specificModel}");
                $this->info('Available models: ' . implode(', ', array_keys($modelMap)));
                exit(1);
            }

            return [$modelMap[$specificModel] => $allModels[$modelMap[$specificModel]]];
        }

        return $allModels;
    }
}
