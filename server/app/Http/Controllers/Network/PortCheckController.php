<?php

namespace App\Http\Controllers\Network;

use App\Http\Controllers\Controller;
use App\Http\Requests\Network\CheckPortRequest;
use App\Services\Network\PortCheckService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class PortCheckController extends Controller
{
    public function __invoke(CheckPortRequest $request, PortCheckService $service): JsonResponse
    {
        try {
            return response()->json(
                $service->check(
                    $request->validated('host'),
                    $request->validated('port'),
                ),
            );
        } catch (InvalidArgumentException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
