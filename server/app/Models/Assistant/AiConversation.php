<?php

namespace App\Models\Assistant;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'archived_at', 'pinned_at', 'last_activity_at'])]
class AiConversation extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
            'pinned_at' => 'datetime',
            'last_activity_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AiMessage::class, 'conversation_id')
            ->orderBy('sequence')
            ->orderBy('id');
    }

    public function generations(): HasMany
    {
        return $this->hasMany(AiGeneration::class, 'conversation_id');
    }
}
