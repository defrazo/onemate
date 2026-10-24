<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RememberOAuthRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        if (
            $request->isMethod('GET') &&
            $request->is('oauth/authorize') &&
            !$request->user('web')
        ) {
            $request->session()->put(
                'oauth_return_url',
                $request->fullUrl(),
            );
        }

        return $next($request);
    }
}
