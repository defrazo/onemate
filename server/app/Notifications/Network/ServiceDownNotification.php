<?php

namespace App\Notifications\Network;

use App\Models\MonitoredService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ServiceDownNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly MonitoredService $service)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function databaseType(object $notifiable): string
    {
        return 'network.service_down';
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Сервис недоступен',
            'message' => "{$this->service->name} перестал отвечать",
        ];
    }
}
