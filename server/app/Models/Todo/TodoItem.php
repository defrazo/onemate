<?php

namespace App\Models\Todo;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['text', 'is_completed', 'position'])]
class TodoItem extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['is_completed' => 'boolean', 'position' => 'integer'];
    }

    public function list(): BelongsTo
    {
        return $this->belongsTo(TodoList::class, 'list_id');
    }
}
