<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminMedical
{
    public function handle(Request $request, Closure $next): Response
    {
        $role = $request->user()?->role;

        if (!in_array($role, ['admin', 'admin_medical'])) {
            return response()->json([
                'message' => 'Action non autorisée.',
            ], 403);
        }

        return $next($request);
    }
}
