<?php

namespace App\Engines;

use Laravel\Scout\Builder;
use Laravel\Scout\Engines\Engine;
use Typesense\Client;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\LazyCollection;
use Illuminate\Database\Eloquent\Model;

class TypesenseEngine extends Engine
{
    protected $typesense;

    public function __construct(Client $typesense)
    {
        $this->typesense = $typesense;
    }

    public function update($models)
    {
        if ($models->isEmpty()) {
            return;
        }

        $model = $models->first();
        $collectionName = $model->searchableAs();

        // Create collection if it doesn't exist
        $this->createCollectionIfNotExists($model, $collectionName);

        $documents = $models->map(function ($model) {
            $array = $model->toSearchableArray();
            $array['id'] = (string) $model->getScoutKey();
            return $array;
        })->values()->all();

        if (!empty($documents)) {
            $this->typesense->collections[$collectionName]->documents->import($documents, [
                'action' => 'upsert'
            ]);
        }
    }

    public function delete($models)
    {
        if ($models->isEmpty()) {
            return;
        }

        $model = $models->first();
        $collectionName = $model->searchableAs();

        $models->each(function ($model) use ($collectionName) {
            $this->typesense->collections[$collectionName]->documents[(string) $model->getScoutKey()]->delete();
        });
    }

    public function search(Builder $builder)
    {
        return $this->performSearch($builder, [
            'per_page' => $builder->limit,
            'page' => 1,
        ]);
    }

    public function paginate(Builder $builder, $perPage, $page)
    {
        return $this->performSearch($builder, [
            'per_page' => $perPage,
            'page' => $page,
        ]);
    }

    protected function performSearch(Builder $builder, array $options = [])
    {
        $searchParameters = [
            'q' => $builder->query ?: '*',
            'query_by' => $this->getQueryByFields($builder->model),
            'per_page' => $options['per_page'] ?? 50,
            'page' => $options['page'] ?? 1,
        ];

        // Add filters if any
        if (!empty($builder->wheres)) {
            $filters = [];
            foreach ($builder->wheres as $key => $value) {
                $filters[] = "{$key}:={$value}";
            }
            $searchParameters['filter_by'] = implode(' && ', $filters);
        }

        // Add sorting
        if (!empty($builder->orders)) {
            $sortBy = [];
            foreach ($builder->orders as $order) {
                $direction = $order['direction'] === 'desc' ? 'desc' : 'asc';
                $sortBy[] = "{$order['column']}:{$direction}";
            }
            $searchParameters['sort_by'] = implode(',', $sortBy);
        }

        $collectionName = $builder->model->searchableAs();

        try {
            $results = $this->typesense->collections[$collectionName]->documents->search($searchParameters);
            return $results;
        } catch (\Exception $e) {
            // If collection doesn't exist, return empty results
            return [
                'found' => 0,
                'hits' => [],
                'page' => $options['page'] ?? 1,
            ];
        }
    }

    public function mapIds($results)
    {
        if (!isset($results['hits'])) {
            return collect();
        }

        return collect($results['hits'])->map(function ($hit) {
            return $hit['document']['id'];
        });
    }

    public function map(Builder $builder, $results, $model)
    {
        if (!isset($results['hits']) || count($results['hits']) === 0) {
            return $model->newCollection();
        }

        $objectIds = $this->mapIds($results)->all();
        $objectIdPositions = array_flip($objectIds);

        return $model->getScoutModelsByIds($builder, $objectIds)
            ->filter(function ($model) use ($objectIds) {
                return in_array($model->getScoutKey(), $objectIds);
            })
            ->sortBy(function ($model) use ($objectIdPositions) {
                return $objectIdPositions[$model->getScoutKey()];
            })
            ->values();
    }

    public function getTotalCount($results)
    {
        return $results['found'] ?? 0;
    }

    public function flush($model)
    {
        $collectionName = $model->searchableAs();

        try {
            $this->typesense->collections[$collectionName]->delete();
        } catch (\Exception $e) {
            // Collection might not exist, ignore error
        }
    }

    public function createIndex($name, array $options = [])
    {
        // Typesense doesn't have separate index creation
        // Collections are created automatically when documents are added
    }

    public function deleteIndex($name)
    {
        try {
            $this->typesense->collections[$name]->delete();
        } catch (\Exception $e) {
            // Collection might not exist, ignore error
        }
    }

    protected function createCollectionIfNotExists($model, $collectionName)
    {
        try {
            $this->typesense->collections[$collectionName]->retrieve();
        } catch (\Exception $e) {
            // Collection doesn't exist, create it
            $schema = $this->getCollectionSchema($model, $collectionName);
            $this->typesense->collections->create($schema);
        }
    }

    protected function getCollectionSchema($model, $collectionName)
    {
        // Get custom schema from config if available
        $configKey = get_class($model);
        $modelSettings = config("scout.typesense.model-settings.{$configKey}");
        
        if (isset($modelSettings['collection-schema'])) {
            $schema = $modelSettings['collection-schema'];
            $schema['name'] = $collectionName;
            return $schema;
        }

        // Default schema - analyze the model's searchable array to determine field types
        $searchableArray = $model->toSearchableArray();
        $fields = [
            [
                'name' => 'id',
                'type' => 'string',
            ]
        ];

        foreach ($searchableArray as $key => $value) {
            if ($key === 'id') continue;

            $type = 'string'; // default type
            if (is_int($value)) {
                $type = 'int32';
            } elseif (is_float($value)) {
                $type = 'float';
            } elseif (is_bool($value)) {
                $type = 'bool';
            }

            $fields[] = [
                'name' => $key,
                'type' => $type,
                'optional' => true,
            ];
        }

        return [
            'name' => $collectionName,
            'fields' => $fields,
            'default_sorting_field' => 'id',
        ];
    }

    protected function getQueryByFields($model)
    {
        $configKey = get_class($model);
        $modelSettings = config("scout.typesense.model-settings.{$configKey}");
        
        if (isset($modelSettings['search-parameters']['query_by'])) {
            return $modelSettings['search-parameters']['query_by'];
        }

        // Default to all string fields from the model's searchable array
        $searchableArray = $model->toSearchableArray();
        $stringFields = [];
        
        foreach ($searchableArray as $key => $value) {
            if (is_string($value)) {
                $stringFields[] = $key;
            }
        }

        return empty($stringFields) ? 'id' : implode(',', $stringFields);
    }

    public function lazyMap(Builder $builder, $results, $model)
    {
        if (!isset($results['hits']) || count($results['hits']) === 0) {
            return LazyCollection::make($model->newCollection());
        }

        $objectIds = $this->mapIds($results)->all();
        $objectIdPositions = array_flip($objectIds);

        return $model->queryScoutModelsByIds($builder, $objectIds)
            ->cursor()
            ->filter(function ($model) use ($objectIds) {
                return in_array($model->getScoutKey(), $objectIds);
            })
            ->sortBy(function ($model) use ($objectIdPositions) {
                return $objectIdPositions[$model->getScoutKey()];
            })
            ->values();
    }
}
