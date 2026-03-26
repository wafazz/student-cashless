<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'unreadNotifications' => fn () => $request->user()
                ? $request->user()->unreadNotifications()->count()
                : 0,
            'pibgOutstanding' => fn () => $request->user() && $request->user()->role === 'parent'
                ? \App\Models\PibgFeeParent::where('parent_id', $request->user()->id)->where('status', 'unpaid')->whereHas('fee', fn($q) => $q->where('status', 'active'))->count()
                : 0,
        ];
    }
}
