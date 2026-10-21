<?php

namespace App\Http\Controllers\Network;

use App\Http\Controllers\Controller;
use App\Http\Requests\Network\CheckSslRequest;
use App\Services\Network\SslCheckService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class SslCheckController extends Controller
{
    public function __invoke(CheckSslRequest $request, SslCheckService $service): JsonResponse
    {
        try {
            return response()->json(
                $service->check($request->validated('host')),
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
