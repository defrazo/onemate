<?php

namespace App\Notifications\Kanban;

use App\Models\KanbanTask;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskOverdueNotification extends Notification
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
        return 'kanban.task_overdue';
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Задача просрочена',
            'message' => $this->task->title,
        ];
    }
}
