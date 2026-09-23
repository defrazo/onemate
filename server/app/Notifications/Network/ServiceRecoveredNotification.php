<?php

namespace App\Notifications\Network;

use App\Models\MonitoredService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ServiceRecoveredNotification extends Notification
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
        return 'network.service_recovered';
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Сервис снова доступен',
            'message' => "{$this->service->name} снова отвечает",
        ];
    }
}
