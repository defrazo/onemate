<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 30;

    public function __construct(private readonly string $oldEmail)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function databaseType(object $notifiable): string
    {
        return 'account.email_changed';
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('E-mail OneMate изменён')
            ->view('emails.change-email', [
                'oldEmail' => $this->oldEmail,
                'newEmail' => $notifiable->email,
            ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'E-mail изменён',
            'message' => 'Основной e-mail вашей учётной записи был успешно изменён.',
        ];
    }
}
