<?php

namespace App\Jobs;

use App\Models\MonitoredService;
use App\Notifications\Network\ServiceDownNotification;
use App\Notifications\Network\ServiceRecoveredNotification;
use App\Services\Network\MonitoredServiceCheckService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckMonitoredService implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 30;

    public function __construct(public readonly int $serviceId)
    {
    }

    public function handle(MonitoredServiceCheckService $checkService): void
    {
        $service = MonitoredService::find($this->serviceId);

        if ($service === null || !$service->is_active) {
            return;
        }

        $previousStatus = $service->last_status;

        $service = $checkService->check(
            service: $service,
            recordHistory: true,
        );

        $currentStatus = $service->last_status;

        $user = $service->user;

        $networkNotificationsEnabled =
            $user->profile?->network_notifications_enabled ?? true;

        if (!$networkNotificationsEnabled) {
            return;
        }

        if ($previousStatus === 'up' && $currentStatus === 'down') {
            $user->notify(new ServiceDownNotification($service));
        }

        if ($previousStatus === 'down' && $currentStatus === 'up') {
            $user->notify(new ServiceRecoveredNotification($service));
        }
    }
}
