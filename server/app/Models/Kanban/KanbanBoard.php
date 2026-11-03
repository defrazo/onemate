<?php

namespace App\Models\Kanban;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title'])]
class KanbanBoard extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'revision' => 'integer',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function columns(): HasMany
    {
        return $this->hasMany(KanbanColumn::class, 'board_id');
    }
}
