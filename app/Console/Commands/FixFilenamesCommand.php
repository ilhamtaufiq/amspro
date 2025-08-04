<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Foto;
use Illuminate\Support\Facades\Storage;

class FixFilenamesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fix:filenames';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fixes filename discrepancies for Foto model by renaming files on disk to match database entries.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting filename discrepancy fix...');

        $fotos = Foto::all();

        foreach ($fotos as $foto) {
            $directory = $foto->id;
            $expectedFilename = $foto->filename;

            $expectedPath = $directory . '/' . $expectedFilename;

            // Check if the expected file already exists on disk
            if (Storage::disk('public')->exists($expectedPath)) {
                $this->line("File for ID {$foto->id} already matches: {$expectedPath}");
                continue;
            }

            // List all files in the foto's directory
            $filesInDirectory = Storage::disk('public')->files($directory);

            $actualProblematicFilename = null;
            foreach ($filesInDirectory as $filePath) {
                $filename = basename($filePath);
                if ($filename !== $expectedFilename) {
                    $actualProblematicFilename = $filename;
                    break; // Assuming only one problematic file per directory
                }
            }

            if ($actualProblematicFilename) {
                $actualProblematicPath = $directory . '/' . $actualProblematicFilename;
                try {
                    Storage::disk('public')->move($actualProblematicPath, $expectedPath);
                    $this->info("Renamed file for ID {$foto->id}: {$actualProblematicPath} -> {$expectedPath}");

                    // No need to update $foto->filename as it's already the expected one
                    // $foto->filename = $expectedFilename; // This line is redundant if $foto->filename is already correct
                    // $foto->save(); // This line is also redundant if no change to $foto->filename

                } catch (\Exception $e) {
                    $this->error("Error renaming file for ID {$foto->id}: " . $e->getMessage());
                }
            } else {
                $this->warn("No problematic file found for ID {$foto->id} (expected: {$expectedPath}). Directory content: " . implode(', ', $filesInDirectory));
            }
        }

        $this->info('Filename discrepancy fix completed.');
    }
}
