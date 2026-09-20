<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'url',
    'is_active',
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
            'is_active' => 'boolean',
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
