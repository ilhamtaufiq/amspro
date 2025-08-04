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
            $media = $foto->getFirstMedia('foto/pekerjaan');

            if (!$media) {
                $this->warn("No media found for Foto ID {$foto->id}. Skipping.");
                continue;
            }

            $directory = $media->id; // Spatie uses media ID as directory
            $expectedFilename = $media->file_name;
            $expectedPath = $directory . '/' . $expectedFilename;

            // Get all files in the specific foto's directory
            $filesInDirectory = Storage::disk('public')->files($directory);
            $actualFilenames = array_map('basename', $filesInDirectory);

            // Check if the expected file already exists
            if (in_array($expectedFilename, $actualFilenames)) {
                $this->line("File for ID {$foto->id} already matches: {$expectedPath}");
                continue;
            }

            // If the expected file does not exist, look for a single problematic file
            // This assumes there should only be one file per ID directory that needs renaming
            if (count($actualFilenames) === 1) {
                $actualProblematicFilename = $actualFilenames[0];
                $actualProblematicPath = $directory . '/' . $actualProblematicFilename;

                try {
                    Storage::disk('public')->move($actualProblematicPath, $expectedPath);
                    $this->info("Renamed file for ID {$foto->id}: {$actualProblematicPath} -> {$expectedPath}");
                } catch (\Exception $e) {
                    $this->error("Error renaming file for ID {$foto->id}: " . $e->getMessage());
                }
            } elseif (count($actualFilenames) > 1) {
                $this->warn("Multiple files found for ID {$foto->id} and expected file '{$expectedFilename}' is missing. Cannot automatically fix. Files found: " . implode(', ', $actualFilenames));
            } else {
                $this->warn("No files found for ID {$foto->id} (expected: {$expectedPath}).");
            }
        }

        $this->info('Filename discrepancy fix completed.');
    }
}
