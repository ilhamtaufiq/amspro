<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            if ($request->user()->hasVerifiedEmail()) {
                return redirect()->intended(route('dashboard', absolute: false))->with('info', 'Your email is already verified.');
            }

            $request->user()->sendEmailVerificationNotification();

            return back()->with('success', 'A new verification link has been sent to the email address you provided during registration.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send verification link: ' . $e->getMessage());
        }
    }
}
