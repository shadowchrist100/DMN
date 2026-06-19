<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!in_array($request->user()?->role, ['admin', 'admin_medical', 'admin_organisation'])) {
            return response()->json([
                'message' => 'Action non autorisée.',
            ], 403);
        }

        return $next($request);
    }
}
