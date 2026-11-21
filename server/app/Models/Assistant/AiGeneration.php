<?php

namespace App\Models\Assistant;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_message_id',
    'response_message_id',
    'request_id',
    'fingerprint',
    'mode',
    'provider',
    'model',
    'actual_model',
    'search_enabled',
    'search_executed',
    'sources',
    'status',
    'error_code',
    'input_tokens',
    'output_tokens',
    'total_tokens',
    'duration_ms',
    'queued_at',
    'started_at',
    'request_started_at',
    'completed_at',
    'cancelled_at',
    'execution_deadline_at',
    'execution_id',
    'execution_finished_at',
])]
class AiGeneration extends Model
{
    use HasUuids;

    public const STATUS_QUEUED = 'queued';

    public const STATUS_RUNNING = 'running';

    public const STATUS_SUCCEEDED = 'succeeded';

    public const STATUS_FAILED = 'failed';

    public const STATUS_CANCELLED = 'cancelled';

    protected function casts(): array
    {
        return [
            'search_enabled' => 'boolean',
            'search_executed' => 'boolean',
            'sources' => 'array',
            'input_tokens' => 'integer',
            'output_tokens' => 'integer',
            'total_tokens' => 'integer',
            'duration_ms' => 'integer',
            'queued_at' => 'datetime',
            'started_at' => 'datetime',
            'request_started_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'execution_deadline_at' => 'datetime',
            'execution_finished_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id');
    }

    public function userMessage(): BelongsTo
    {
        return $this->belongsTo(AiMessage::class, 'user_message_id');
    }

    public function responseMessage(): BelongsTo
    {
        return $this->belongsTo(AiMessage::class, 'response_message_id');
    }
}
