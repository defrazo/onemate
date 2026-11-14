<?php

namespace App\Http\Controllers\Assistant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assistant\RegenerateGenerationRequest;
use App\Http\Requests\Assistant\RetryGenerationRequest;
use App\Http\Resources\Assistant\GenerationResource;
use App\Services\Assistant\AssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantGenerationController extends Controller
{
    public function __invoke(
        Request $request,
        string $generation,
        AssistantService $service,
    ): GenerationResource {
        abort_if($request->user()->role === 'demo', 403);

        return new GenerationResource(
            $service->show($request->user(), $generation),
        );
    }

    public function cancel(
        Request $request,
        string $generation,
        AssistantService $service,
    ): GenerationResource {
        abort_if($request->user()->role === 'demo', 403);

        return new GenerationResource(
            $service->cancel($request->user(), $generation),
        );
    }

    public function retry(
        RetryGenerationRequest $request,
        string $generation,
        AssistantService $service,
    ): JsonResponse {
        $result = $service->retry(
            $request->user(),
            $generation,
            $request->validated('request_id'),
        );

        return (new GenerationResource($result))
            ->response()
            ->setStatusCode(202);
    }

    public function regenerate(
        RegenerateGenerationRequest $request,
        string $generation,
        AssistantService $service,
    ): JsonResponse {
        $result = $service->regenerate(
            $request->user(),
            $generation,
            $request->validated('request_id'),
            (bool) $request->validated('search_enabled', false),
        );

        return (new GenerationResource($result))
            ->response()
            ->setStatusCode(202);
    }
}
