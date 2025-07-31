<?php

use App\Http\Controllers\PekerjaanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\KontrakController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PenyediaController;
use App\Http\Controllers\FotoController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\OutputController;
use App\Http\Controllers\KeuanganController;
use App\Http\Controllers\PenerimaController;
use App\Http\Controllers\BerkasController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\DokumenPekerjaanController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/php-limits', function () {
    return [
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size'),
        'memory_limit' => ini_get('memory_limit'),
        'php_ini_loaded_file' => php_ini_loaded_file(),
    ];
});
// Public routes or routes accessible to all authenticated users
Route::post('/set-tahun', function (Request $request) {
    $tahun = $request->input('tahun');
    session(['tahun' => $tahun]);
    return response()->json([
        'message' => 'Tahun updated successfully',
        'tahun' => $tahun,
    ]);
})->middleware('auth')->name('set-tahun');


Route::get('/', [DashboardController::class, 'index'])->name('dashboard')->middleware('auth');
Route::get('/map', [MapController::class, 'index'])->name('map.index')->middleware('auth');
Route::get('/dokumen-pekerjaan', [DokumenPekerjaanController::class, 'index'])->name('dokumen-pekerjaan.index')->middleware('auth');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/pengawas-users', [PekerjaanController::class, 'getPengawasUsers'])->name('pengawas.users');
    Route::put('/pekerjaan/{pekerjaan}/pengawas', [PekerjaanController::class, 'updatePekerjaanPengawas'])->name('pekerjaan.updatePengawas');
    // Profile Routes (Accessible to all authenticated users)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Group routes by common permissions
    Route::middleware(['permission:view users|create users|edit users|delete users'])->group(function () {
        Route::resource('users', UserController::class);
    });

    Route::middleware(['permission:view pekerjaan|create pekerjaan|edit pekerjaan|delete pekerjaan'])->group(function () {
        Route::resource('pekerjaan', PekerjaanController::class);
        Route::post('/pekerjaan/{pekerjaan}/penerima/ocr', [PenerimaController::class, 'ocrPreview'])->name('penerima.ocr');
        Route::post('/pekerjaan/import', [PekerjaanController::class, 'import'])->name('pekerjaan.import');
        Route::get('/datapaket/export', [PekerjaanController::class, 'export'])->name('pekerjaan.export');
    });

    // Kontrak Resource Routes (Custom store/update due to storeOrUpdate method)
    Route::post('kontrak', [KontrakController::class, 'storeOrUpdate'])->name('kontrak.store')->middleware('permission:create kontrak');
    Route::put('kontrak/{kontrak}', [KontrakController::class, 'storeOrUpdate'])->name('kontrak.update')->middleware('permission:edit kontrak');
    Route::get('kontrak/{kontrak}/cover-pdf', [KontrakController::class, 'generateCoverPdf'])->name('kontrak.coverPdf')->middleware('permission:view kontrak');
    Route::resource('kontrak', KontrakController::class)->except(['store', 'update'])->middleware(['permission:view kontrak|create kontrak|edit kontrak|delete kontrak']);

    Route::middleware(['permission:view kegiatan|create kegiatan|edit kegiatan|delete kegiatan'])->group(function () {
        Route::resource('kegiatan', KegiatanController::class);
    });

    Route::middleware(['permission:view roles|create roles|edit roles|delete roles'])->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    });

    Route::middleware(['permission:view roles|create roles|edit roles|delete roles'])->group(function () {
        Route::resource('permissions', PermissionController::class);
    });

    Route::middleware(['permission:view penyedia|create penyedia|edit penyedia|delete penyedia'])->group(function () {
        Route::resource('penyedia', PenyediaController::class);
    });

    // Routes restricted to Super Admin role
    Route::middleware(['role:Super Admin'])->group(function () {
        Route::resource('todos', TodoController::class);
        Route::resource('status', StatusController::class);
    });

    // Nested resource routes for 'pekerjaan'
    Route::prefix('pekerjaan/{pekerjaan}')->middleware(['auth'])->group(function () {
        Route::resource('fotos', FotoController::class)->except(['create', 'edit']);
        Route::resource('outputs', OutputController::class)->except(['create', 'edit']);
        Route::resource('keuangan', KeuanganController::class)->except(['create', 'edit']);
        Route::resource('penerima', PenerimaController::class)->except(['create', 'edit']);
        Route::resource('berkas', BerkasController::class)->except(['create', 'edit']);
        Route::get('berkas/{berkasId}/download', [BerkasController::class, 'download'])->name('berkas.download');
        Route::get('print-photos', [FotoController::class, 'print'])->name('fotos.print');

        // Progress Routes (Restricted by permissions) - these permissions are already handled by the parent group
        Route::get('/progress', [ProgressController::class, 'index'])->name('progress.index')->middleware('permission:view pekerjaan');
        Route::post('/progress', [ProgressController::class, 'store'])->name('progress.store')->middleware('permission:create pekerjaan|tfl');
        Route::put('/progress/{progress}', [ProgressController::class, 'update'])->name('progress.update')->middleware('permission:edit pekerjaan|tfl');
        Route::delete('/progress/{progress}', [ProgressController::class, 'destroy'])->name('progress.destroy')->middleware('permission:delete pekerjaan|tfl');
    });

    Route::get('/settings/menu', [\App\Http\Controllers\MenuSettingsController::class, 'index'])->name('settings.menu.index')->middleware('role:Super Admin');
    Route::post('/settings/menu', [\App\Http\Controllers\MenuSettingsController::class, 'store'])->name('settings.menu.store')->middleware('role:Super Admin');
});

require __DIR__ . '/auth.php';

use App\Http\Controllers\ReverseGeocodeController;

Route::get('/reverse-geocode', [ReverseGeocodeController::class, 'reverseGeocode']);