<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Auth;
use App\Models\Menu;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'tahun_aktif' => fn () => session('tahun', now()->year),
            'flash' => function () {
                return [
                    'success' => Session::get('success'),
                    'error' => Session::get('error'),
                    'warning' => Session::get('warning'),
                    'info' => Session::get('info'),
                ];
            },
            'menu' => function () {
                if (Auth::check()) {
                    $user = Auth::user();
                    if ($user->hasRole('Super Admin')) {
                        return Menu::all();
                    }
                    return $user->getMenus();
                }
                return [];
            },
        ]);
          if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
