<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status_account !== 'verified') {
            return response()->json([
                'message' => 'Votre compte est en attente de vérification par un administrateur.',
            ], 403);
        }

        return $next($request);
    }
}
