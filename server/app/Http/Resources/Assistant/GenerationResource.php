<?php

namespace App\Http\Resources\Assistant;

use App\Models\Assistant\AiGeneration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GenerationResource extends JsonResource
{
    private bool $includeResponse = true;

    public function withoutResponse(): self
    {
        $this->includeResponse = false;

        return $this;
    }

    public function toArray(Request $request): array
    {
        $response = $this->includeResponse
            && $this->status === AiGeneration::STATUS_SUCCEEDED
            && $this->responseMessage;

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'user_message_id' => $this->user_message_id,
            'status' => $this->status,
            'execution_pending' => $this->execution_finished_at === null,
            'mode' => $this->mode,
            'provider' => $this->provider,
            'model' => $this->model,
            'actual_model' => $this->actual_model,
            'search_enabled' => (bool) $this->search_enabled,
            'search_executed' => $this->search_executed,
            'sources' => $this->sources ?? [],
            'error_code' => $this->error_code,
            'input_tokens' => $this->input_tokens,
            'output_tokens' => $this->output_tokens,
            'total_tokens' => $this->total_tokens,
            'duration_ms' => $this->duration_ms,
            'created_at' => $this->created_at?->toISOString(),
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'response' => $response
                ? new MessageResource($this->responseMessage)
                : null,
        ];
    }
}
