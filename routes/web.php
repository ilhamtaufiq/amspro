<?php

use App\Http\Controllers\PekerjaanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KegiatanController;
use App\Http\Controllers\KontrakController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PenyediaController;
use App\Http\Controllers\FotoController;
use App\Http\Controllers\ProgressController; // Add ProgressController
use App\Http\Controllers\OutputController;
use App\Http\Controllers\KeuanganController;
use App\Http\Controllers\PenerimaController;
use App\Http\Controllers\BerkasController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StatusController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::post('/set-tahun', function (Request $request) {
    $tahun = $request->input('tahun');
    session(['tahun' => $tahun]);
    return response()->json([
        'message' => 'Tahun updated successfully',
        'tahun' => $tahun,
    ]);
})->middleware('auth')->name('set-tahun');

Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard')->middleware('auth');
Route::match(['get', 'post'], '/chat', [ChatController::class, 'index'])->name('chat.index');

Route::middleware(['auth', 'verified'])->group(function () {
    // Profile Routes (Accessible to all authenticated users)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Users Resource Routes (Restricted by permissions)
    Route::resource('users', UserController::class)->middleware(['permission:view users|create users|edit users|delete users']);

    // Pekerjaan Resource Routes (Restricted by permissions)
    Route::resource('pekerjaan', PekerjaanController::class)->middleware(['permission:view pekerjaan|create pekerjaan|edit pekerjaan|delete pekerjaan']);
    Route::post('/pekerjaan/{pekerjaan}/penerima/ocr', [PenerimaController::class, 'ocrPreview'])->name('penerima.ocr');
    // Kontrak Resource Routes (Restricted by permissions)
    Route::resource('kontrak', KontrakController::class)->middleware(['permission:view kontrak|create kontrak|edit kontrak|delete kontrak']);

    // Kegiatan Resource Routes (Restricted by permissions)
    Route::resource('kegiatan', KegiatanController::class)->middleware(['permission:view kegiatan|create kegiatan|edit kegiatan|delete kegiatan']);

    // Roles Resource Routes (Restricted by permissions)
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index')->middleware('permission:view roles');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store')->middleware('permission:create roles');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update')->middleware('permission:edit roles');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->middleware('permission:delete roles');

    // Penyedia Resource Routes (Restricted by permissions)
    Route::resource('penyedia', PenyediaController::class)->middleware(['permission:view penyedia|create penyedia|edit penyedia|delete penyedia']);
    Route::resource('status', StatusController::class)->middleware(['role:Super Admin']);

    // Foto Routes (Restricted by permissions)
    // Route::prefix('pekerjaan/{pekerjaanId}')->group(function () {
    //     Route::get('/fotos', [FotoController::class, 'index'])->name('fotos.index')->middleware('permission:view foto');
    //     Route::post('/fotos', [FotoController::class, 'store'])->name('fotos.store')->middleware('permission:create foto');
    //     Route::delete('/fotos/{id}', [FotoController::class, 'destroy'])->name('fotos.destroy')->middleware('permission:delete foto');
    //     Route::resource('outputs', OutputController::class)->except(['create', 'edit']);
    //     Route::resource('keuangan', KeuanganController::class)->except(['create', 'edit']);
    //     Route::resource('penerima', PenerimaController::class)->except(['create', 'edit']);

    //     // Progress Routes (Restricted by permissions)
    //     Route::get('/progress', [ProgressController::class, 'index'])->name('progress.index')->middleware('permission:view pekerjaan');
    //     Route::post('/progress', [ProgressController::class, 'store'])->name('progress.store')->middleware('permission:create pekerjaan');
    //     Route::put('/progress/{progress}', [ProgressController::class, 'update'])->name('progress.update')->middleware('permission:edit pekerjaan');
    //     Route::delete('/progress/{progress}', [ProgressController::class, 'destroy'])->name('progress.destroy')->middleware('permission:delete pekerjaan');

    // });
    Route::prefix('pekerjaan/{pekerjaan}')->middleware(['auth'])->group(function () {
        // Foto Routes
        // Route::get('/fotos', [FotoController::class, 'index'])->name('fotos.index')->middleware('permission:view foto');
        // Route::post('/fotos', [FotoController::class, 'store'])->name('fotos.store')->middleware('permission:create foto');
        // Route::delete('/fotos/{id}', [FotoController::class, 'destroy'])->name('fotos.destroy')->middleware('permission:delete foto');

        // Resource Routes
        Route::resource('fotos', FotoController::class)->except(['create', 'edit']);
        Route::resource('outputs', OutputController::class)->except(['create', 'edit']);
        Route::resource('keuangan', KeuanganController::class)->except(['create', 'edit']);
        Route::resource('penerima', PenerimaController::class)->except(['create', 'edit']);
        Route::resource('berkas', BerkasController::class)->except(['create', 'edit']);

        // Progress Routes
        Route::get('/progress', [ProgressController::class, 'index'])->name('progress.index')->middleware('permission:view pekerjaan');
        Route::post('/progress', [ProgressController::class, 'store'])->name('progress.store')->middleware('permission:create pekerjaan');
        Route::put('/progress/{progress}', [ProgressController::class, 'update'])->name('progress.update')->middleware('permission:edit pekerjaan');
        Route::delete('/progress/{progress}', [ProgressController::class, 'destroy'])->name('progress.destroy')->middleware('permission:delete pekerjaan');
    });
    Route::post('/pekerjaan/import', [PekerjaanController::class, 'import'])->name('pekerjaan.import');
    Route::get('/datapaket/export', [PekerjaanController::class, 'export'])->name('pekerjaan.export');
});

require __DIR__ . '/auth.php';
