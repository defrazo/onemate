<?php

namespace App\Http\Controllers\Network;

use App\Http\Controllers\Controller;
use App\Http\Requests\Network\CheckServiceRequest;
use App\Services\Network\ServiceCheckService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class ServiceCheckController extends Controller
{
    public function __invoke(CheckServiceRequest $request, ServiceCheckService $service): JsonResponse
    {
        try {
            return response()->json(
                $service->check($request->validated('url')),
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
