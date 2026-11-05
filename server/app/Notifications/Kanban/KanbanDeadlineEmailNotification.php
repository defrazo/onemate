<?php

namespace App\Notifications\Kanban;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KanbanDeadlineEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $timeout = 30;

    public function __construct(
        private readonly string $taskTitle,
        private readonly string $boardTitle,
        private readonly string $endDate,
        private readonly bool $overdue,
    ) {
        $this->onConnection('database')->beforeCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $title = $this->overdue ? 'Задача просрочена' : 'Напоминание о сроке задачи';

        return (new MailMessage)
            ->subject($title . ' – OneMate')
            ->view('emails.kanban-deadline', [
                'title' => $title,
                'taskTitle' => $this->taskTitle,
                'boardTitle' => $this->boardTitle,
                'endDate' => $this->endDate,
                'overdue' => $this->overdue,
                'url' => rtrim(config('app.frontend_url'), '/') . '/kanban',
            ]);
    }
}
