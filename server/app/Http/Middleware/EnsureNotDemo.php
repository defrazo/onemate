<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotDemo
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user('web')?->role === 'demo') {
            abort(403, 'OAuth недоступен в демо-режиме');
        }

        return $next($request);
    }
}
