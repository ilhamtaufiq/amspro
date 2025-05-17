<?php

namespace App\Http\Controllers;

use App\Models\Pekerjaan;
use App\Models\Kegiatan;
use App\Models\Kecamatan;
use App\Models\Desa;
use App\Models\Role;
use App\Models\Penyedia;
use App\Models\Kontrak;
use App\Models\Foto;
use App\Models\Progress; // Add Progress model
use App\Models\Berkas; // Add Progress model
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\PekerjaanImport;
use App\Exports\PekerjaanExport;
use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use Inertia\Inertia;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PekerjaanController extends Controller
{
    public function getPekerjaan()
    {
        $pekerjaan = Pekerjaan::paginate(10);
        return ApiResponse::success($pekerjaan, 'Daftar pekerjaan berhasil diambil');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tahun = $request->query('tahun', session('tahun', now()->year));
        $search = $request->query('search', '');
        $perPage = $request->query('per_page', 10);
        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');

        // Build the query for pekerjaan
        $query = Pekerjaan::with(['kegiatan', 'kecamatan', 'desa'])
            ->whereHas('kegiatan', function ($query) use ($tahun) {
                $query->where('tahun_anggaran', $tahun);
            });

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_paket', 'like', '%' . $search . '%')
                    ->orWhereHas('kecamatan', function ($q) use ($search) {
                        $q->where('n_kec', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('desa', function ($q) use ($search) {
                        $q->where('n_desa', 'like', '%' . $search . '%');
                    });
            });
        }

        // Apply sorting
        if ($sortField) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Fetch kegiatanList for the selected tahun
        $kegiatanList = Kegiatan::where('tahun_anggaran', $tahun)
            ->select('id', 'nama')
            ->get()
            ->toArray();

        $kecamatanList = Kecamatan::select('id', 'n_kec')->get()->toArray();
        $desaList = Desa::select('id', 'n_desa', 'kecamatan_id')->get()->toArray();

        // Paginate pekerjaan
        $pekerjaan = $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'kode_rekening' => $item->kode_rekening,
                    'nama_paket' => $item->nama_paket,
                    'kegiatan' => $item->kegiatan ? $item->kegiatan->nama : null, // Ensure kegiatan is loaded
                    'kegiatan_id' => $item->kegiatan_id,
                    'kecamatan' => $item->kecamatan ? $item->kecamatan->n_kec : null,
                    'kecamatan_id' => $item->kecamatan_id,
                    'desa' => $item->desa ? $item->desa->n_desa : null,
                    'desa_id' => $item->desa_id,
                    'pagu' => $item->pagu,
                    'created_at' => $item->created_at ? $item->created_at->toDateTimeString() : null,
                    'updated_at' => $item->updated_at ? $item->updated_at->toDateTimeString() : null,
                    'tahun_anggaran' => $item->kegiatan ? $item->kegiatan->tahun_anggaran : null,
                ];
            });

        return Inertia::render('pekerjaan/index', [
            'pekerjaan' => $pekerjaan->items(),
            'meta' => [
                'current_page' => $pekerjaan->currentPage(),
                'last_page' => $pekerjaan->lastPage(),
                'from' => $pekerjaan->firstItem(),
                'to' => $pekerjaan->lastItem(),
                'total' => $pekerjaan->total(),
                'per_page' => $pekerjaan->perPage(),
                'links' => collect($pekerjaan->linkCollection())->map(function ($link) {
                    return [
                        'url' => $link['url'],
                        'label' => strip_tags($link['label']),
                        'active' => $link['active'],
                    ];
                }),
            ],
            'tahun' => (int) $tahun,
            'search' => $search,
            'kegiatanList' => $kegiatanList,
            'kecamatanList' => $kecamatanList,
            'desaList' => $desaList,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_paket' => 'required|string|max:255',
            'kegiatan_id' => 'required|exists:tbl_kegiatan,id',
            'kecamatan_id' => 'required|exists:tbl_kecamatan,id',
            'desa_id' => 'required|exists:tbl_desa,id',
            'pagu' => 'required|numeric',
        ]);

        $pekerjaan = Pekerjaan::create([
            'nama_paket' => $validated['nama_paket'],
            'kegiatan_id' => $validated['kegiatan_id'],
            'kecamatan_id' => $validated['kecamatan_id'],
            'desa_id' => $validated['desa_id'],
            'pagu' => $validated['pagu']
        ]);

        return redirect()->back()->with('success', 'Pekerjaan created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $roleId = Auth::user()->roles->first()->id ?? null;

        $query = Pekerjaan::with([
            'desa',
            'kecamatan',
            'kegiatan',
            'progresses.output',
            'outputs',
            'keuangan',
            'penerimas',
        ])->where('id', $id);

        if ($roleId) {
            $query->whereExists(function ($subQuery) use ($roleId) {
                $subQuery->select(DB::raw(1))
                         ->from('kegiatan_role')
                         ->whereColumn('kegiatan_role.kegiatan_id', 'tbl_pekerjaan.kegiatan_id')
                         ->where('kegiatan_role.role_id', $roleId);
            });
        }

        $pekerjaan = $query->firstOrFail();

        $kontrak = Kontrak::where('id_pekerjaan', $pekerjaan->id)->first();

        $penyediaList = Penyedia::all()->map(function ($penyedia) {
            return [
                'id' => $penyedia->id,
                'nama' => $penyedia->nama,
            ];
        })->toArray();

        $fotos = Foto::where('pekerjaan_id', $pekerjaan->id)
            ->with(['media', 'penerima', 'output'])
            ->get()
            ->map(function ($foto) {
                return [
                    'id' => $foto->id,
                    'pekerjaan_id' => $foto->pekerjaan_id,
                    'komponen_id' => $foto->komponen_id,
                    'penerima_id' => $foto->penerima_id,
                    'keterangan' => $foto->keterangan,
                    'koordinat' => $foto->koordinat,
                    'created_at' => $foto->created_at->toDateTimeString(),
                    'photo_url' => $foto->getFirstMediaUrl('foto/pekerjaan'),
                    'komponen_nama' => $foto->output ? $foto->output->komponen : null,
                    'penerima_nama' => $foto->penerima ? $foto->penerima->nama : null,
                ];
            })->toArray();

        $progresses = $pekerjaan->progresses->map(function ($progress) {
            return [
                'id' => $progress->id,
                'pekerjaan_id' => $progress->pekerjaan_id,
                'komponen_id' => $progress->komponen_id,
                'komponen_nama' => $progress->output ? $progress->output->komponen : null,
                'realisasi_fisik' => $progress->realisasi_fisik,
                'output_volume' => $progress->output ? $progress->output->volume : null,
                'created_at' => $progress->created_at->toDateTimeString(),
            ];
        })->toArray();

        $outputs = $pekerjaan->outputs->map(function ($output) {
            return [
                'id' => $output->id,
                'pekerjaan_id' => $output->pekerjaan_id,
                'komponen' => $output->komponen,
                'satuan' => $output->satuan,
                'volume' => $output->volume,
                'created_at' => $output->created_at->toDateTimeString(),
            ];
        })->toArray();

        $penerimas = $pekerjaan->penerimas->map(function ($penerima) {
            return [
                'id' => $penerima->id,
                'pekerjaan_id' => $penerima->pekerjaan_id,
                'nama' => $penerima->nama,
                'jumlah_jiwa' => $penerima->jumlah_jiwa,
                'nik' => $penerima->nik,
                'alamat' => $penerima->alamat,
                'created_at' => $penerima->created_at ? $penerima->created_at->toDateTimeString() : null,
                'updated_at' => $penerima->updated_at ? $penerima->updated_at->toDateTimeString() : null,
            ];
        })->toArray();

        $berkasList = Berkas::where('pekerjaan_id', $pekerjaan->id)
        ->with('media')
        ->get()
        ->map(function ($berkas) {
            return [
                'id' => $berkas->id,
                'pekerjaan_id' => $berkas->pekerjaan_id,
                'jenis_dokumen' => $berkas->jenis_dokumen,
                'created_at' => $berkas->created_at->toDateTimeString(),
                'file_url' => $berkas->getFirstMediaUrl('berkas/dokumen'),
            ];
        })->toArray();

        $keuangan = $pekerjaan->keuangan ? [
            'id' => $pekerjaan->keuangan->id,
            'pekerjaan_id' => $pekerjaan->keuangan->pekerjaan_id,
            'realisasi' => $pekerjaan->keuangan->realisasi,
            'created_at' => $pekerjaan->keuangan->created_at->toDateTimeString(),
            'updated_at' => $pekerjaan->keuangan->updated_at->toDateTimeString(),
        ] : null;

        return Inertia::render('pekerjaan/detail', [
            'pekerjaan' => [
                'id' => $pekerjaan->id,
                'kode_rekening' => $pekerjaan->kode_rekening,
                'nama_paket' => $pekerjaan->nama_paket,
                'kegiatan' => $pekerjaan->kegiatan ? $pekerjaan->kegiatan->nama : null,
                'kecamatan' => $pekerjaan->kecamatan ? $pekerjaan->kecamatan->n_kec : null,
                'desa' => $pekerjaan->desa ? $pekerjaan->desa->n_desa : null,
                'kegiatan_id' => $pekerjaan->kegiatan_id,
                'kecamatan_id' => $pekerjaan->kecamatan_id,
                'desa_id' => $pekerjaan->desa_id,
                'pagu' => $pekerjaan->pagu,
                'created_at' => $pekerjaan->created_at ? $pekerjaan->created_at->toDateTimeString() : null,
                'updated_at' => $pekerjaan->updated_at ? $pekerjaan->updated_at->toDateTimeString() : null,
                'tahun_anggaran' => $pekerjaan->kegiatan ? $pekerjaan->kegiatan->tahun_anggaran : null,
            ],
            'kontrak' => $kontrak ? [
                'id' => $kontrak->id,
                'id_kegiatan' => $kontrak->id_kegiatan,
                'id_pekerjaan' => $kontrak->id_pekerjaan,
                'id_penyedia' => $kontrak->id_penyedia,
                'kode_rup' => $kontrak->kode_rup,
                'kode_paket' => $kontrak->kode_paket,
                'nomor_penawaran' => $kontrak->nomor_penawaran,
                'tanggal_penawaran' => $kontrak->tanggal_penawaran,
                'nilai_kontrak' => $kontrak->nilai_kontrak,
                'tgl_sppbj' => $kontrak->tgl_sppbj,
                'tgl_spk' => $kontrak->tgl_spk,
                'tgl_spmk' => $kontrak->tgl_spmk,
                'tgl_selesai' => $kontrak->tgl_selesai,
                'sppbj' => $kontrak->sppbj,
                'spk' => $kontrak->spk,
                'spmk' => $kontrak->spmk,
            ] : null,
            'keuangan' => $keuangan,
            'penyediaList' => $penyediaList,
            'fotos' => $fotos,
            'progresses' => $progresses,
            'outputs' => $outputs,
            'penerimas' => $penerimas,
            'berkasList' => $berkasList,
            'auth' => [
                'user' => Auth::user() ? [
                    'name' => Auth::user()->name,
                    'email' => Auth::user()->email,
                    'roles' => Auth::user()->roles->pluck('name'),
                    'permissions' => Auth::user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'errors' => session('errors') ? session('errors')->getBag('default')->getMessages() : [],
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pekerjaan $pekerjaan)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_paket' => 'required|string|max:255',
            'kegiatan_id' => 'required|exists:tbl_kegiatan,id',
            'kecamatan_id' => 'required|exists:tbl_kecamatan,id',
            'desa_id' => 'required|exists:tbl_desa,id',
            'pagu' => 'required|numeric',
        ]);

        $pekerjaan = Pekerjaan::findOrFail($id);

        $pekerjaan->update([
            'nama_paket' => $validated['nama_paket'],
            'kegiatan_id' => $validated['kegiatan_id'],
            'kecamatan_id' => $validated['kecamatan_id'],
            'desa_id' => $validated['desa_id'],
            'pagu' => $validated['pagu']
        ]);

        return redirect()->back()->with('success', 'Pekerjaan updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $pekerjaan = Pekerjaan::withoutGlobalScopes()->findOrFail($id);
        $pekerjaan->delete();

        return redirect()->route('pekerjaan.index')
            ->with('success', 'Data pekerjaan berhasil dihapus.')
            ->with('deletedPekerjaanId', $id);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
            'tahun' => 'required|integer',
        ]);

        try {
            Excel::import(new PekerjaanImport($request->tahun), $request->file('file'));

            return redirect()->back()->with('success', 'Data pekerjaan berhasil diimport.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengimport data: ' . $e->getMessage());
        }
    }
    public function export(Request $request)
    {
        $tahun = $request->query('tahun', now()->year);
        $search = $request->query('search', '');

        return Excel::download(
            new PekerjaanExport($tahun, $search),
            'pekerjaan_' . $tahun . '_' . now()->format('Ymd_His') . '.xlsx'
        );
    }
    public function downloadTemplate()
    {
        $filePath = public_path('templates/pekerjaan_template.xlsx');
        return response()->download($filePath, 'pekerjaan_template.xlsx');
    }
}
