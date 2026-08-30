<?php

namespace App\Models;

use App\Enums\UserLocationType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['type', 'name', 'region', 'country', 'lat', 'lon'])]
class UserLocation extends Model
{
    protected function casts(): array
    {
        return [
            'type' => UserLocationType::class,
            'lat' => 'float',
            'lon' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
