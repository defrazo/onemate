<?php

namespace App\Http\Controllers\Assistant;

use App\AI\GroqUsage;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantLimitsController extends Controller
{
    public function __invoke(Request $request, GroqUsage $usage): JsonResponse
    {
        abort_if($request->user()->role === 'demo', 403);

        return response()
            ->json($usage->snapshot())
            ->header('Cache-Control', 'no-store');
    }
}
