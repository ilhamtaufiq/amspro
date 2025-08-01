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
        $notifications = Notification::where('recipient_id', Auth::id())
            ->whereNull('read_at')
            ->latest()
            ->get();

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
        }

        return back();
    }

    public function all()
    {
        $notifications = Notification::where('recipient_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }
}
