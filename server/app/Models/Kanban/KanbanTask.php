<?php

namespace App\Models\Kanban;

use App\Models\User\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'column_id',
    'title',
    'description',
    'status',
    'priority',
    'position',
    'start_date',
    'end_date',
    'remind_before_days',
    'completed',
])]
class KanbanTask extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return [
            'position' => 'float',
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'remind_before_days' => 'integer',
            'reminder_notified_date' => 'date:Y-m-d',
            'reminder_email_queued_date' => 'date:Y-m-d',
            'overdue_email_queued_date' => 'date:Y-m-d',
            'completed' => 'boolean',
            'overdue_notified_date' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(KanbanColumn::class, 'column_id');
    }
}
