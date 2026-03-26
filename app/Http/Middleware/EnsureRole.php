<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Flatten comma-separated roles (e.g. 'operator,cashier')
        $allowed = [];
        foreach ($roles as $role) {
            foreach (explode(',', $role) as $r) {
                $allowed[] = trim($r);
            }
        }

        if (!$request->user() || !in_array($request->user()->role, $allowed)) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
