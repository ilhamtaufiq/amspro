<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pekerjaan;
use App\Models\Kontrak;
use App\Models\User;
use App\Models\Penyedia;

class SearchController extends Controller
{
    /**
     * Display the search interface.
     */
    public function index(Request $request)
    {
        $query = $request->get('q', '');
        $type = $request->get('type', 'all');
        $perPage = $request->get('per_page', 15);
        
        $results = [];
        
        if (!empty($query)) {
            $results = $this->performSearch($query, $type, $perPage);
        }
        
        return Inertia::render('Search/Index', [
            'query' => $query,
            'type' => $type,
            'results' => $results,
            'searchTypes' => $this->getSearchTypes(),
        ]);
    }

    /**
     * API endpoint for search suggestions.
     */
    public function suggestions(Request $request)
    {
        $query = $request->get('q', '');
        $type = $request->get('type', 'all');
        
        if (empty($query) || strlen($query) < 2) {
            return response()->json([]);
        }
        
        $results = $this->performSearch($query, $type, 5);
        
        return response()->json($results);
    }

    /**
     * API endpoint for search results.
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1',
            'type' => 'sometimes|string|in:all,pekerjaan,kontrak,users,penyedia',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'page' => 'sometimes|integer|min:1',
            'filters' => 'sometimes|array',
        ]);
        
        $query = $request->get('q');
        $type = $request->get('type', 'all');
        $perPage = $request->get('per_page', 15);
        $filters = $request->get('filters', []);
        
        $results = $this->performSearch($query, $type, $perPage, $filters);
        
        return response()->json([
            'query' => $query,
            'type' => $type,
            'results' => $results,
            'search_types' => $this->getSearchTypes(),
        ]);
    }

    /**
     * Perform the actual search across models.
     */
    protected function performSearch($query, $type = 'all', $perPage = 15, $filters = [])
    {
        $results = [];
        
        if ($type === 'all' || $type === 'pekerjaan') {
            $results['pekerjaan'] = $this->searchPekerjaan($query, $perPage, $filters);
        }
        
        if ($type === 'all' || $type === 'kontrak') {
            $results['kontrak'] = $this->searchKontrak($query, $perPage, $filters);
        }
        
        if ($type === 'all' || $type === 'users') {
            $results['users'] = $this->searchUsers($query, $perPage, $filters);
        }
        
        if ($type === 'all' || $type === 'penyedia') {
            $results['penyedia'] = $this->searchPenyedia($query, $perPage, $filters);
        }
        
        return $results;
    }

    /**
     * Search Pekerjaan models.
     */
    protected function searchPekerjaan($query, $perPage, $filters = [])
    {
        $builder = Pekerjaan::search($query);
        
        // Apply filters
        if (isset($filters['tahun_anggaran'])) {
            $builder->where('tahun_anggaran', $filters['tahun_anggaran']);
        }
        
        if (isset($filters['n_kec'])) {
            $builder->where('n_kec', $filters['n_kec']);
        }
        
        if (isset($filters['n_desa'])) {
            $builder->where('n_desa', $filters['n_desa']);
        }
        
        $results = $builder->paginate($perPage);
        
        return [
            'data' => $results->items(),
            'total' => $results->total(),
            'per_page' => $results->perPage(),
            'current_page' => $results->currentPage(),
            'last_page' => $results->lastPage(),
            'type' => 'pekerjaan',
            'title' => 'Pekerjaan',
        ];
    }

    /**
     * Search Kontrak models.
     */
    protected function searchKontrak($query, $perPage, $filters = [])
    {
        $builder = Kontrak::search($query);
        
        // Apply date range filters if provided
        if (isset($filters['date_from']) && isset($filters['date_to'])) {
            // Note: Typesense filtering would need to be implemented in the engine
            // For now, we'll filter after the search
        }
        
        $results = $builder->paginate($perPage);
        
        return [
            'data' => $results->items(),
            'total' => $results->total(),
            'per_page' => $results->perPage(),
            'current_page' => $results->currentPage(),
            'last_page' => $results->lastPage(),
            'type' => 'kontrak',
            'title' => 'Kontrak',
        ];
    }

    /**
     * Search User models.
     */
    protected function searchUsers($query, $perPage, $filters = [])
    {
        $builder = User::search($query);
        
        // Apply role filter if provided
        if (isset($filters['role'])) {
            $builder->where('roles', $filters['role']);
        }
        
        $results = $builder->paginate($perPage);
        
        return [
            'data' => $results->items(),
            'total' => $results->total(),
            'per_page' => $results->perPage(),
            'current_page' => $results->currentPage(),
            'last_page' => $results->lastPage(),
            'type' => 'users',
            'title' => 'Users',
        ];
    }

    /**
     * Search Penyedia models.
     */
    protected function searchPenyedia($query, $perPage, $filters = [])
    {
        $builder = Penyedia::search($query);
        
        $results = $builder->paginate($perPage);
        
        return [
            'data' => $results->items(),
            'total' => $results->total(),
            'per_page' => $results->perPage(),
            'current_page' => $results->currentPage(),
            'last_page' => $results->lastPage(),
            'type' => 'penyedia',
            'title' => 'Penyedia',
        ];
    }

    /**
     * Get available search types.
     */
    protected function getSearchTypes()
    {
        return [
            'all' => 'Semua',
            'pekerjaan' => 'Pekerjaan',
            'kontrak' => 'Kontrak',
            'users' => 'Users',
            'penyedia' => 'Penyedia',
        ];
    }

    /**
     * Get search statistics.
     */
    public function stats()
    {
        return response()->json([
            'total_pekerjaan' => Pekerjaan::count(),
            'total_kontrak' => Kontrak::count(),
            'total_users' => User::count(),
            'total_penyedia' => Penyedia::count(),
        ]);
    }
}
