<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;

class CreateTestNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:create-test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create test notifications for testing purposes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->error('No users found. Please create users first.');
            return 1;
        }

        $testNotifications = [
            [
                'title' => 'Welcome to AMS Pro!',
                'message' => 'Selamat datang di sistem AMS Pro. Sistem ini akan membantu Anda mengelola pekerjaan dengan lebih efisien.',
                'type' => 'info'
            ],
            [
                'title' => 'Pekerjaan Baru Ditambahkan',
                'message' => 'Pekerjaan "Pembangunan Jalan Desa" telah ditambahkan ke sistem. Silakan review dan update progress.',
                'type' => 'success'
            ],
            [
                'title' => 'Deadline Mendekati',
                'message' => 'Pekerjaan "Renovasi Gedung" akan berakhir dalam 3 hari. Pastikan semua target tercapai.',
                'type' => 'warning'
            ],
            [
                'title' => 'Error pada Sistem',
                'message' => 'Terjadi error pada sistem backup. Tim IT sedang menangani masalah ini.',
                'type' => 'error'
            ],
            [
                'title' => 'Update Sistem',
                'message' => 'Sistem akan diupdate pada malam ini pukul 23:00 WIB. Mohon simpan semua pekerjaan Anda.',
                'type' => 'info'
            ]
        ];

        $sender = $users->first();
        $recipients = $users->take(3); // Send to first 3 users

        foreach ($recipients as $recipient) {
            foreach ($testNotifications as $notification) {
                Notification::create([
                    'title' => $notification['title'],
                    'message' => $notification['message'],
                    'type' => $notification['type'],
                    'sender_id' => $sender->id,
                    'recipient_id' => $recipient->id,
                ]);
            }
        }

        $this->info('Test notifications created successfully!');
        $this->info('Created ' . (count($testNotifications) * $recipients->count()) . ' notifications for ' . $recipients->count() . ' users.');

        return 0;
    }
}
