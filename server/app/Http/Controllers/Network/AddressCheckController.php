<?php

namespace App\Http\Controllers\Network;

use App\Http\Controllers\Controller;
use App\Http\Requests\Network\CheckAddressRequest;
use App\Services\Network\AddressCheckService;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class AddressCheckController extends Controller
{
    public function __invoke(CheckAddressRequest $request, AddressCheckService $service): JsonResponse
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
