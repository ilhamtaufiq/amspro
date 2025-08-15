<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::with('sender')
            ->where('recipient_id', Auth::id())
            ->whereNull('read_at')
            ->latest()
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'created_at' => $notification->created_at->toISOString(),
                    'read_at' => $notification->read_at?->toISOString(),
                    'sender' => $notification->sender ? [
                        'name' => $notification->sender->name,
                        'avatar' => null, // Add avatar if you have it
                        'initials' => strtoupper(substr($notification->sender->name, 0, 2)),
                    ] : null,
                ];
            });

        return response()->json($notifications);
    }

    public function create()
    {
        $users = User::all();
        return Inertia::render('notifications/create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,warning,success,error',
            'recipient_id' => 'required|exists:users,id',
        ]);

        Notification::create([
            'title' => $request->title,
            'message' => $request->message,
            'type' => $request->type,
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
        ]);

        return redirect()->route('notifications.create')->with('success', 'Notification sent successfully.');
    }

    public function markAsRead(Notification $notification)
    {
        if ($notification->recipient_id === Auth::id()) {
            $notification->update(['read_at' => now()]);
            return response()->json(['success' => true]);
        }
        
        return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
    }

    public function all()
    {
        $notifications = Notification::with('sender')
            ->where('recipient_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }
}
