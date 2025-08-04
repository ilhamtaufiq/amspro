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
    protected $description = 'Fixes filename discrepancies for Foto model, specifically for 0%.png issues.';

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
            $actualFilenamePattern = '0%.png'; // Assuming this is the common problematic filename

            $expectedPath = $directory . '/' . $expectedFilename;
            $actualProblematicPath = $directory . '/' . $actualFilenamePattern;

            // Check if the expected file already exists on disk
            if (Storage::disk('public')->exists($expectedPath)) {
                $this->line("File for ID {$foto->id} already matches: {$expectedPath}");
                continue;
            }

            // If the expected file doesn't exist, check for the problematic file
            if (Storage::disk('public')->exists($actualProblematicPath)) {
                try {
                    Storage::disk('public')->move($actualProblematicPath, $expectedPath);
                    $this->info("Renamed file for ID {$foto->id}: {$actualProblematicPath} -> {$expectedPath}");

                    // Update the database entry if the filename was different (e.g., if it was 0%.png in DB)
                    if ($foto->filename !== $expectedFilename) {
                        $foto->filename = $expectedFilename;
                        $foto->save();
                        $this->info("Updated database entry for ID {$foto->id} to: {$expectedFilename}");
                    }
                } catch (\Exception $e) {
                    $this->error("Error renaming file for ID {$foto->id}: " . $e->getMessage());
                }
            } else {
                $this->warn("No matching file found for ID {$foto->id} (expected: {$expectedPath}, found: {$actualProblematicPath})");
            }
        }

        $this->info('Filename discrepancy fix completed.');
    }
}
