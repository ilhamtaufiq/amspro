<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Pekerjaan;
use App\Models\Kegiatan;

class CheckKegiatanPermission
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->route('pekerjaan')) {
            $pekerjaan = Pekerjaan::findOrFail($request->route('pekerjaan'));
            $kegiatan = Kegiatan::findOrFail($pekerjaan->kegiatan_id);
            
            // Check if user has permission and either is admin or has access to this kegiatan
            if (!$request->user()->hasPermissionTo('view pekerjaan') || 
                (!$request->user()->hasRole(['admin']) && 
                !$request->user()->kegiatan()->where('id', $kegiatan->id)->exists())) {
                abort(403, 'Unauthorized action.');
            }
        }

        return $next($request);
    }
} 