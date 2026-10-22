<?php

namespace App\Models\Network;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'type',
    'name',
    'url',
    'host',
    'port',
    'check_via',
    'is_active',
    'order_idx',
    'last_status',
    'last_status_code',
    'last_response_time',
    'last_checked_at',
])]
class MonitoredService extends Model
{
    protected function casts(): array
    {
        return [
            'port' => 'integer',
            'is_active' => 'boolean',
            'order_idx' => 'integer',
            'last_status_code' => 'integer',
            'last_response_time' => 'integer',
            'last_checked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function checks(): HasMany
    {
        return $this->hasMany(MonitoringCheck::class);
    }
}
