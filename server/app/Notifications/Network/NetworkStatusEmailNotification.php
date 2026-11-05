<?php

namespace App\Notifications\Network;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NetworkStatusEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $timeout = 30;

    public function __construct(private readonly string $serviceName, private readonly string $status)
    {
        $this->onConnection('database')->beforeCommit();
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $title = $this->status === 'down' ? 'Сервис недоступен' : 'Сервис снова доступен';

        return (new MailMessage)
            ->subject($title . ' – OneMate')
            ->view('emails.network-status', [
                'title' => $title,
                'serviceName' => $this->serviceName,
                'isDown' => $this->status === 'down',
                'url' => rtrim(config('app.frontend_url'), '/') . '/dashboard',
            ]);
    }
}
