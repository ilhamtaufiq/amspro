<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Typesense\Client;
use App\Models\Pekerjaan;
use App\Models\Kontrak;
use App\Models\User;
use App\Models\Penyedia;

class TypesenseCollectionCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'typesense:collection 
                            {action : The action to perform (create, delete, list, recreate)}
                            {--collection= : Specific collection to manage}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage Typesense collections';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        $collection = $this->option('collection');

        try {
            $client = new Client(config('scout.typesense.client-settings'));
            
            switch ($action) {
                case 'create':
                    $this->createCollections($client, $collection);
                    break;
                case 'delete':
                    $this->deleteCollections($client, $collection);
                    break;
                case 'list':
                    $this->listCollections($client);
                    break;
                case 'recreate':
                    $this->recreateCollections($client, $collection);
                    break;
                default:
                    $this->error("Unknown action: {$action}");
                    $this->info('Available actions: create, delete, list, recreate');
                    return 1;
            }
        } catch (\Exception $e) {
            $this->error('Error connecting to Typesense: ' . $e->getMessage());
            $this->info('Make sure Typesense is running and configuration is correct.');
            return 1;
        }

        return 0;
    }

    /**
     * Create collections.
     */
    private function createCollections($client, $specificCollection = null)
    {
        $collections = $this->getCollectionSchemas($specificCollection);

        foreach ($collections as $collectionName => $schema) {
            $this->info("Creating collection: {$collectionName}");
            
            try {
                $client->collections->create($schema);
                $this->info("✅ Collection '{$collectionName}' created successfully!");
            } catch (\Exception $e) {
                if (strpos($e->getMessage(), 'already exists') !== false) {
                    $this->warn("⚠️ Collection '{$collectionName}' already exists.");
                } else {
                    $this->error("❌ Failed to create collection '{$collectionName}': " . $e->getMessage());
                }
            }
        }
    }

    /**
     * Delete collections.
     */
    private function deleteCollections($client, $specificCollection = null)
    {
        $collections = $this->getCollectionNames($specificCollection);

        if ($this->confirm('Are you sure you want to delete the specified collections? This cannot be undone.')) {
            foreach ($collections as $collectionName) {
                $this->info("Deleting collection: {$collectionName}");
                
                try {
                    $client->collections[$collectionName]->delete();
                    $this->info("✅ Collection '{$collectionName}' deleted successfully!");
                } catch (\Exception $e) {
                    if (strpos($e->getMessage(), 'Not Found') !== false) {
                        $this->warn("⚠️ Collection '{$collectionName}' does not exist.");
                    } else {
                        $this->error("❌ Failed to delete collection '{$collectionName}': " . $e->getMessage());
                    }
                }
            }
        } else {
            $this->info('Operation cancelled.');
        }
    }

    /**
     * List collections.
     */
    private function listCollections($client)
    {
        try {
            $collections = $client->collections->retrieve();
            
            if (empty($collections)) {
                $this->info('No collections found.');
                return;
            }

            $headers = ['Name', 'Fields', 'Documents', 'Created'];
            $rows = [];

            foreach ($collections as $collection) {
                $rows[] = [
                    $collection['name'],
                    count($collection['fields']),
                    $collection['num_documents'] ?? 0,
                    isset($collection['created_at']) ? date('Y-m-d H:i:s', $collection['created_at']) : 'N/A'
                ];
            }

            $this->table($headers, $rows);
            $this->info('📊 Total collections: ' . count($collections));
        } catch (\Exception $e) {
            $this->error('Failed to retrieve collections: ' . $e->getMessage());
        }
    }

    /**
     * Recreate collections.
     */
    private function recreateCollections($client, $specificCollection = null)
    {
        $this->info('Recreating collections (delete + create)...');
        
        // First delete
        $this->deleteCollections($client, $specificCollection);
        
        // Then create
        $this->createCollections($client, $specificCollection);
        
        $this->info('🔄 Collections recreated successfully!');
    }

    /**
     * Get collection schemas.
     */
    private function getCollectionSchemas($specificCollection = null)
    {
        $modelSettings = config('scout.typesense.model-settings');
        $schemas = [];

        foreach ($modelSettings as $modelClass => $settings) {
            $model = new $modelClass();
            $collectionName = $model->searchableAs();
            
            if ($specificCollection && $collectionName !== $specificCollection) {
                continue;
            }
            
            $schema = $settings['collection-schema'];
            $schema['name'] = $collectionName;
            
            $schemas[$collectionName] = $schema;
        }

        if ($specificCollection && empty($schemas)) {
            $this->error("Collection '{$specificCollection}' not found in configuration.");
            exit(1);
        }

        return $schemas;
    }

    /**
     * Get collection names.
     */
    private function getCollectionNames($specificCollection = null)
    {
        if ($specificCollection) {
            return [$specificCollection];
        }

        $modelSettings = config('scout.typesense.model-settings');
        $names = [];

        foreach ($modelSettings as $modelClass => $settings) {
            $model = new $modelClass();
            $names[] = $model->searchableAs();
        }

        return $names;
    }
}
