<?php
namespace App\Http\Controllers;

use App\Http\Resources\PekerjaanResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        if ($request->isMethod('post')) {
            $userMessage = strtolower($request->input('message'));

            // Contoh: Total pekerjaan
            if (preg_match('/\b(total pekerjaan|jumlah pekerjaan)\b/i', $userMessage)) {
                $totalPekerjaan = Cache::remember('total_pekerjaan', now()->addHours(1), function () {
                    return DB::table('pekerjaan_dataset')->count();
                });
                $aiMessage = "Total pekerjaan adalah $totalPekerjaan.";
                return Inertia::render('chat/index', [
                    'initialMessages' => [],
                    'flash' => [
                        'data' => [
                            'userMessage' => $userMessage,
                            'aiMessage' => $aiMessage,
                            'databaseResults' => null,
                            'recordCount' => $totalPekerjaan,
                        ],
                    ],
                ]);
            }

            // Contoh: Pencarian berdasarkan kata kunci generik
            if (preg_match('/\b(data kontrak|kontrak)\b/i', $userMessage)) {
                // Ekstrak kata kunci pencarian (contoh sederhana)
                $keywords = explode(' ', $userMessage);
                $searchTerm = implode('%', array_filter($keywords, fn($word) => !in_array($word, ['data', 'kontrak'])));

                $records = Cache::remember('pekerjaan_search_' . md5($searchTerm), now()->addHours(1), function () use ($searchTerm) {
                    return DB::table('pekerjaan_dataset')
                        ->select([
                            'pekerjaan_id',
                            'job_name',
                            'budget',
                            'contract_value',
                            'no_spk',
                            'contract_date',
                            'provider_name',
                            'desa',
                            'kecamatan',
                            'physical_progress',
                        ])
                        ->where('job_name', 'like', "%$searchTerm%")
                        ->orWhere('desa', 'like', "%$searchTerm%")
                        ->orWhere('kecamatan', 'like', "%$searchTerm%")
                        ->paginate(10);
                });

                $totalRecords = $records->total();

                $aiMessage = $totalRecords > 0
                    ? "Berikut adalah data kontrak yang ditemukan:\n" .
                      $records->map(function ($record) {
                          return "- Pekerjaan: {$record->job_name}, Desa: {$record->desa}, Kecamatan: {$record->kecamatan}, " .
                                 "Nomor SPK: {$record->no_spk}, Nilai Kontrak: Rp " . number_format($record->contract_value, 0, ',', '.') . ", " .
                                 "Penyedia: {$record->provider_name}";
                      })->implode("\n")
                    : "Tidak ditemukan data kontrak yang sesuai dengan pencarian.";

                return Inertia::render('chat/index', [
                    'initialMessages' => [],
                    'flash' => [
                        'data' => [
                            'userMessage' => $userMessage,
                            'aiMessage' => $aiMessage,
                            'databaseResults' => PekerjaanResource::collection($records),
                            'recordCount' => $totalRecords,
                        ],
                    ],
                ]);
            }

            // Dataset umum
            $records = Cache::remember('pekerjaan_dataset_page_' . $request->get('page', 1), now()->addHours(1), function () {
                return DB::table('pekerjaan_dataset')
                    ->select([
                        'pekerjaan_id',
                        'job_name',
                        'budget',
                        'kecamatan',
                        'desa',
                        'year',
                        'contract_value',
                        'no_spk',
                        'contract_date',
                        'provider_name',
                        'recipient_count',
                        'photo_count',
                        'physical_progress',
                        'financial_realization',
                    ])
                    ->paginate(100);
            });

            $totalJobs = Cache::remember('total_pekerjaan', now()->addHours(1), fn() => DB::table('pekerjaan_dataset')->count());

            return Inertia::render('chat/index', [
                'initialMessages' => [],
                'flash' => [
                    'data' => [
                        'userMessage' => $userMessage,
                        'aiMessage' => null,
                        'databaseResults' => PekerjaanResource::collection($records),
                        'recordCount' => $totalJobs,
                    ],
                ],
            ]);
        }

        return Inertia::render('chat/index', ['initialMessages' => []]);
    }
}