<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MonitoredServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'userId' => $this->user_id,
            'type' => $this->type,
            'name' => $this->name,
            'isActive' => $this->is_active,
            'lastStatus' => $this->last_status,
            'lastResponseTime' => $this->last_response_time,
            'lastCheckedAt' => $this->last_checked_at?->toISOString(),
            'createdAt' => $this->created_at->toISOString(),
            'updatedAt' => $this->updated_at->toISOString(),
        ];

        if ($this->type === 'http') {
            return [
                ...$data,
                'url' => $this->url,
                'lastStatusCode' => $this->last_status_code,
            ];
        }

        return [
            ...$data,
            'host' => $this->host,
            'port' => $this->port,
        ];
    }
}
