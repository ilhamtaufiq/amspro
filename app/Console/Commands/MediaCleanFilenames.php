<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaCleanFilenames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:clean-filenames';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scans media files with % in their names and renames them, updating the database.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Scanning for media files with % in their names...');

        $mediaItems = Media::where('file_name', 'like', '%\%%') // Escape % for LIKE query
                            ->get();

        if ($mediaItems->isEmpty()) {
            $this->info('No media files found with % in their names. Exiting.');
            return;
        }

        $this->info(count($mediaItems) . ' media items found. Processing...');

        foreach ($mediaItems as $media) {
            $oldFileName = $media->file_name;
            $extension = pathinfo($oldFileName, PATHINFO_EXTENSION);
            $newFileName = Str::random(40) . '.' . $extension; // Generate a random 40-character string for the new filename

            $disk = $media->disk;

            // Get the path relative to the disk root
            $oldDiskPath = $media->getPathRelativeToRoot();
            $directoryOnDisk = dirname($oldDiskPath);

            // Construct the new path relative to the disk root
            $newDiskPath = $directoryOnDisk . '/' . $newFileName;

            try {
                $this->info("Attempting to move file: {$oldDiskPath} to {$newDiskPath} on disk {$disk}");
                if (Storage::disk($disk)->exists($oldDiskPath)) {
                    $this->info("File exists on disk: {$oldDiskPath}");
                } else {
                    $this->error("File DOES NOT exist on disk: {$oldDiskPath}");
                }

                if (Storage::disk($disk)->exists($oldDiskPath)) {
                    Storage::disk($disk)->move($oldDiskPath, $newDiskPath);

                    $media->file_name = $newFileName;
                    $media->save();

                    $this->info("Renamed '{$oldFileName}' to '{$newFileName}' (ID: {$media->id})");
                } else {
                    $this->warn("File '{$oldDiskPath}' not found on disk '{$disk}'. Skipping database update for this item (ID: {$media->id}).");
                }
            } catch (\Exception $e) {
                $this->error("Error processing media ID {$media->id}: " . $e->getMessage());
            }
        }

        $this->info('Media filename cleaning complete.');
    }
}
