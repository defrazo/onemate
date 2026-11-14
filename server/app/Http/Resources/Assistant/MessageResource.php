<?php

namespace App\Http\Resources\Assistant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $answerGeneration = $this->resource->relationLoaded('answerGeneration')
            ? $this->answerGeneration
            : null;

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sequence' => $this->sequence,
            'role' => $this->role,
            'content' => $this->content,
            'reply_to_message_id' => $this->reply_to_message_id,
            'created_at' => $this->created_at?->toISOString(),
            'answer_generation' => $answerGeneration
                ? (new GenerationResource($answerGeneration))->withoutResponse()
                : null,
        ];
    }
}
