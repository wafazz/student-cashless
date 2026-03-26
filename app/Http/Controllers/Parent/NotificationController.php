<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = auth()->user()->notifications()->paginate(20);

        return Inertia::render('parent/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back()->with('success', 'All notifications marked as read.');
    }
}
