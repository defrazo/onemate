<?php

namespace App\Http\Controllers\Assistant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Assistant\ConversationResource;
use App\Http\Resources\Assistant\ConversationSnapshotResource;
use App\Services\Assistant\AssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AssistantConversationController extends Controller
{
    public function store(Request $request, AssistantService $service): JsonResponse
    {
        $this->authorizeAssistant($request);

        return response()->json($service->newConversation($request->user()));
    }

    public function index(Request $request, AssistantService $service): AnonymousResourceCollection
    {
        $this->authorizeAssistant($request);

        $data = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        return ConversationResource::collection(
            $service->archive($request->user(), $data['search'] ?? null),
        );
    }

    public function pin(Request $request, string $conversation, AssistantService $service): ConversationResource
    {
        $this->authorizeAssistant($request);

        $data = $request->validate([
            'pinned' => ['required', 'boolean'],
        ]);

        return new ConversationResource(
            $service->pinConversation($request->user(), $conversation, (bool) $data['pinned']),
        );
    }

    public function destroy(Request $request, string $conversation, AssistantService $service): JsonResponse
    {
        $this->authorizeAssistant($request);

        $service->deleteConversation($request->user(), $conversation);

        return response()->json([
            'deleted_conversation_id' => $conversation,
        ]);
    }

    public function active(Request $request, AssistantService $service): ConversationSnapshotResource
    {
        $this->authorizeAssistant($request);

        return new ConversationSnapshotResource(
            $service->active($request->user()),
        );
    }

    public function messages(Request $request, string $conversation, AssistantService $service): ConversationSnapshotResource
    {
        $this->authorizeAssistant($request);

        $data = $request->validate([
            'before_sequence' => ['sometimes', 'integer', 'min:1'],
        ]);

        $before = isset($data['before_sequence'])
            ? (int) $data['before_sequence']
            : null;

        return new ConversationSnapshotResource(
            $service->messages($request->user(), $conversation, $before),
        );
    }

    private function authorizeAssistant(Request $request): void
    {
        abort_unless(
            $request->user() !== null && $request->user()->role !== 'demo',
            403,
        );
    }
}
