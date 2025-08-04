<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class MediaScanDiskFilenames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:scan-disk-filenames';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scans media files on disk for filenames containing % and checks for discrepancies with database.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Scanning media files on disk for filenames containing % and checking for discrepancies...');

        $mediaItems = Media::all();
        $foundIssues = false;

        foreach ($mediaItems as $media) {
            $disk = $media->disk;
            $dbFileName = $media->file_name;
            $directoryOnDisk = Storage::disk($disk)->path($media->id); // Get the actual directory path

            // Check if the directory exists
            if (!File::isDirectory($directoryOnDisk)) {
                $this->warn("Directory for Media ID {$media->id} not found: {$directoryOnDisk}");
                continue;
            }

            $filesInDirectory = File::files($directoryOnDisk);

            $foundActualFile = false;
            foreach ($filesInDirectory as $file) {
                $actualFileName = $file->getFilename();

                // Check for % or %25 in the actual filename on disk
                if (str_contains($actualFileName, '%') || str_contains($actualFileName, '%25')) {
                    $this->warn("Found file on disk with % or %25: ID {$media->id}, Actual Filename: {$actualFileName}, Directory: {$directoryOnDisk}");
                    $foundIssues = true;
                }

                // Check if the actual filename matches the database filename
                if ($actualFileName === $dbFileName) {
                    $foundActualFile = true;
                }
            }

            // If the database filename is not found on disk, it's a discrepancy
            if (!$foundActualFile) {
                $this->error("Discrepancy: Database filename '{$dbFileName}' for Media ID {$media->id} not found in directory {$directoryOnDisk}. Actual files found: " . implode(', ', array_map(fn($f) => $f->getFilename(), $filesInDirectory)));
                $foundIssues = true;
            }

            // Also check if the database filename itself contains % (should be fixed by clean-filenames)
            if (str_contains($dbFileName, '%') || str_contains($dbFileName, '%25')) {
                $this->warn("Found database entry with % or %25: ID {$media->id}, DB Filename: {$dbFileName}");
                $foundIssues = true;
            }
        }

        if (!$foundIssues) {
            $this->info('No media files found on disk or in database with % in their names, and no discrepancies found.');
        } else {
            $this->info('Scan complete. Please review the warnings/errors above.');
        }
    }
}
Console\Commands;

use Illuminate\Console\Command;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Storage;

class MediaScanDiskFilenames extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'media:scan-disk-filenames';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scans media files on disk for filenames containing %.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Scanning media files on disk for filenames containing %...');

        $mediaItems = Media::all();
        $foundIssues = false;

        foreach ($mediaItems as $media) {
            $disk = $media->disk;
            $pathRelativeToRoot = $media->getPathRelativeToRoot();
            $filePathOnDisk = Storage::disk($disk)->path($pathRelativeToRoot);
            $fileNameOnDisk = basename($filePathOnDisk);

            $this->info("Checking Media ID: {$media->id}, DB Filename: {$media->file_name}, Disk Path: {$filePathOnDisk}, Disk Filename: {$fileNameOnDisk}");

            if (str_contains($fileNameOnDisk, '%') || str_contains($fileNameOnDisk, '%25')) {
                $this->warn("Found file on disk with % or %25: ID {$media->id}, Path: {$filePathOnDisk}");
                $foundIssues = true;
            }

            if (str_contains($media->file_name, '%') || str_contains($media->file_name, '%25')) {
                $this->warn("Found database entry with % or %25: ID {$media->id}, DB Filename: {$media->file_name}");
                $foundIssues = true;
            }
        }

        if (!$foundIssues) {
            $this->info('No media files found on disk or in database with % in their names.');
        } else {
            $this->info('Scan complete. Please review the warnings above.');
        }
    }
}
