<?php

namespace App\Http\Controllers;

use App\Models\Penerima;
use App\Models\Pekerjaan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\Process\Process;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PenerimaController extends Controller
{
    public function ocrPreview(Request $request, Pekerjaan $pekerjaan)
    {
        try {
            $request->validate([
                'ktp' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            if (!$request->hasFile('ktp')) {
                return response()->json(['error' => 'File KTP tidak ditemukan'], 400);
            }

            // Store the file temporarily
            $ktp_file = $request->file('ktp');
            $ktp_path = $ktp_file->store('temp', 'public');
            $full_path = storage_path('app/public/' . $ktp_path);

            // Verify file exists
            if (!file_exists($full_path)) {
                Log::error('KTP file not found at: ' . $full_path);
                return response()->json(['error' => 'Gagal menyimpan file KTP'], 500);
            }

            // Verify script exists
            $script_path = storage_path('app/scripts/ktp_ocr.py');
            if (!file_exists($script_path)) {
                Log::error('OCR script not found at: ' . $script_path);
                return response()->json(['error' => 'Script OCR tidak ditemukan'], 500);
            }

            // Use full path to Python executable
            $python_path = 'C:/laragon/bin/python/python-3.10/python.exe';
            if (!file_exists($python_path)) {
                Log::error('Python executable not found at: ' . $python_path);
                return response()->json(['error' => 'Python executable tidak ditemukan'], 500);
            }

            // Log paths for debugging
            Log::debug('Python path: ' . $python_path);
            Log::debug('Script path: ' . $script_path);
            Log::debug('KTP image path: ' . $full_path);

            // Call Tesseract-based OCR script
            $process = new Process([$python_path, $script_path, $full_path]);
            $process->setTimeout(30);
            $process->run();

            // Delete temporary file
            Storage::disk('public')->delete($ktp_path);

            if (!$process->isSuccessful()) {
                Log::error('OCR process failed', [
                    'error' => $process->getErrorOutput(),
                    'output' => $process->getOutput(),
                    'exit_code' => $process->getExitCode(),
                    'command' => $process->getCommandLine(),
                ]);
                return response()->json(['error' => 'Gagal mengekstrak data KTP: Proses OCR gagal'], 500);
            }

            // Get and validate OCR output
            $output = $process->getOutput();
            Log::debug('OCR script output: ' . $output);

            // Attempt to decode JSON
            $ocr_data = json_decode($output, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Invalid JSON from OCR script', [
                    'output' => $output,
                    'json_error' => json_last_error_msg(),
                ]);
                return response()->json(['error' => 'Gagal mengekstrak data KTP: Output OCR tidak valid'], 500);
            }

            if (isset($ocr_data['error'])) {
                Log::error('OCR script returned error: ' . $ocr_data['error']);
                return response()->json(['error' => 'Gagal mengekstrak data KTP: ' . $ocr_data['error']], 500);
            }

            // Validate OCR-extracted NIK
            $nik_validator = Validator::make(['nik' => $ocr_data['nik']], [
                'nik' => 'required|string|size:16|regex:/^\d{16}$/',
            ]);

            if ($nik_validator->fails()) {
                return response()->json([
                    'error' => 'NIK tidak valid (harus 16 digit angka)',
                    'nama' => $ocr_data['nama'] ?? '',
                    'nik' => '',
                    'alamat' => $ocr_data['alamat'] ?? '',
                ], 400);
            }

            return response()->json($ocr_data);
        } catch (\Exception $e) {
            // Ensure temporary file is deleted on exception
            if (isset($ktp_path)) {
                Storage::disk('public')->delete($ktp_path);
            }
            Log::error('OCR preview exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Gagal mengekstrak data KTP: ' . $e->getMessage()], 500);
        }
    }

    // Other methods (store, update, destroy) remain unchanged
}
