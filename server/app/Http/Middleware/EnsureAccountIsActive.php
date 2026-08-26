<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->deleted_at) {
            return response()->json([
                'code' => 'ACCOUNT_DELETED',
            ], 403);
        }

        return $next($request);
    }
}
