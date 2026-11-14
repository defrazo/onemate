<?php

namespace App\Models\Assistant;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['sequence', 'role', 'content', 'reply_to_message_id'])]
class AiMessage extends Model
{
    use HasUuids;

    public const ROLE_USER = 'user';

    public const ROLE_ASSISTANT = 'assistant';

    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id');
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_message_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'reply_to_message_id');
    }

    public function generations(): HasMany
    {
        return $this->hasMany(AiGeneration::class, 'user_message_id');
    }

    public function answerGeneration(): HasOne
    {
        return $this->hasOne(AiGeneration::class, 'response_message_id')
            ->where('status', AiGeneration::STATUS_SUCCEEDED)
            ->orderByDesc('completed_at')
            ->orderByDesc('id');
    }
}
