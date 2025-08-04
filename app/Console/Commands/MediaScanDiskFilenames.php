<?php

namespace App\Console\Commands;

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
