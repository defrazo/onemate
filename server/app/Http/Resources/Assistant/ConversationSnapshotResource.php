<?php

namespace App\Http\Resources\Assistant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationSnapshotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $conversation = $this->resource['conversation'];
        $pending = $this->resource['pending_generation'];

        return [
            'conversation' => $conversation
                ? new ConversationResource($conversation)
                : null,
            'messages' => MessageResource::collection($this->resource['messages']),
            'generations' => GenerationResource::collection($this->resource['generations']),
            'pending_generation' => $pending
                ? new GenerationResource($pending)
                : null,
            'execution_pending' => $pending !== null,
            'pagination' => $this->resource['pagination'],
        ];
    }
}
