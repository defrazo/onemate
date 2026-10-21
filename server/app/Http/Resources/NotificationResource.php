<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->data['title'],
            'message' => $this->data['message'],
            'readAt' => $this->read_at?->toISOString(),
            'createdAt' => $this->created_at->toISOString(),
        ];
    }
}
