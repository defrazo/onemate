<?php

namespace App\Notifications\Kanban;

use App\Models\Kanban\KanbanTask;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskDueSoonNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly KanbanTask $task)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function databaseType(object $notifiable): string
    {
        return 'kanban.task_due_soon';
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => match ($this->task->remind_before_days) {
                0 => 'Срок задачи – сегодня',
                1 => 'Срок задачи – завтра',
                7 => 'До срока задачи – неделя',
                default => 'До срока задачи – ' . $this->task->remind_before_days . ' дня',
            },
            'message' => $this->task->title,
        ];
    }
}
