<?php

namespace App\Models\Todo;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'color', 'slot', 'is_collapsed'])]
class TodoList extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['slot' => 'integer', 'is_collapsed' => 'boolean'];
    }

    public function canvas(): BelongsTo
    {
        return $this->belongsTo(TodoCanvas::class, 'canvas_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(TodoItem::class, 'list_id')->orderBy('position')->orderBy('id');
    }
}
