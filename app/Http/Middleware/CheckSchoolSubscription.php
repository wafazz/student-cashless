<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSchoolSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if (in_array($user->role, ['operator', 'cashier'])) {
            $canteen = $user->getCanteenForWork();
            if ($canteen && $canteen->school && $canteen->school->subscription_status === 'inactive') {
                return back()->with('error', 'Your school subscription has expired. Please contact the administrator.');
            }
        }

        return $next($request);
    }
}
