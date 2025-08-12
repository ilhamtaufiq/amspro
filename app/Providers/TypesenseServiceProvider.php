<?php

namespace App\Providers;

use App\Engines\TypesenseEngine;
use Illuminate\Support\ServiceProvider;
use Laravel\Scout\EngineManager;
use Typesense\Client;

class TypesenseServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        resolve(EngineManager::class)->extend('typesense', function () {
            $config = config('scout.typesense.client-settings');
            
            $client = new Client($config);
            
            return new TypesenseEngine($client);
        });
    }
}
