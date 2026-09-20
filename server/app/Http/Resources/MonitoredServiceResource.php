<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MonitoredServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'name' => $this->name,
            'url' => $this->url,
            'isActive' => $this->is_active,
            'lastStatus' => $this->last_status,
            'lastStatusCode' => $this->last_status_code,
            'lastResponseTime' => $this->last_response_time,
            'lastCheckedAt' => $this->last_checked_at?->toISOString(),
            'createdAt' => $this->created_at->toISOString(),
            'updatedAt' => $this->updated_at->toISOString(),
        ];
    }
}
