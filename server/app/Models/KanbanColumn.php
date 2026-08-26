<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'task_limit', 'position', 'color', 'unique_key'])]
class KanbanColumn extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'task_limit' => 'integer',
            'position' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(KanbanTask::class, 'column_id');
    }
}
