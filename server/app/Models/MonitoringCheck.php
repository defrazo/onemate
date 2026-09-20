<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['status', 'status_code', 'response_time', 'checked_at'])]
class MonitoringCheck extends Model
{
    protected function casts(): array
    {
        return [
            'status_code' => 'integer',
            'response_time' => 'integer',
            'checked_at' => 'datetime',
        ];
    }

    public function monitoredService(): BelongsTo
    {
        return $this->belongsTo(MonitoredService::class);
    }
}
