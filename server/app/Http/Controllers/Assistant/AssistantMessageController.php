<?php

namespace App\Http\Controllers\Assistant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assistant\SendMessageRequest;
use App\Http\Resources\Assistant\GenerationResource;
use App\Http\Resources\Assistant\MessageResource;
use App\Services\Assistant\AssistantService;
use Illuminate\Http\JsonResponse;

class AssistantMessageController extends Controller
{
    public function __invoke(SendMessageRequest $request, AssistantService $service): JsonResponse
    {
        $generation = $service->send($request->user(), $request->validated());

        return response()->json([
            'message' => new MessageResource($generation->userMessage),
            'generation' => new GenerationResource($generation),
        ], 202);
    }
}
