<?php

namespace App\Services\Network;

use App\Models\MonitoredService;
use App\Notifications\Network\ServiceDownNotification;
use App\Notifications\Network\ServiceRecoveredNotification;

class MonitoredServiceCheckService
{
    public function __construct(
        private readonly ServiceCheckService $serviceCheckService,
        private readonly PortCheckService $portCheckService,
    ) {
    }

    public function check(MonitoredService $service): MonitoredService
    {
        $previousStatus = $service->last_status;
        $checkedAt = now();

        if ($service->type === 'http') {
            $result = $this->serviceCheckService->check($service->url);

            $status = $result['status'];
            $statusCode = $result['statusCode'];
            $responseTime = $result['responseTime'];
        } else {
            $result = $this->portCheckService->check(
                $service->host,
                $service->port,
            );

            $status = $result['status'] === 'open'
                ? 'up'
                : 'down';

            $statusCode = null;
            $responseTime = $result['responseTime'];
        }

        $service->update([
            'last_status' => $status,
            'last_status_code' => $statusCode,
            'last_response_time' => $responseTime,
            'last_checked_at' => $checkedAt,
        ]);

        $service->checks()->create([
            'status' => $status,
            'status_code' => $statusCode,
            'response_time' => $responseTime,
            'checked_at' => $checkedAt,
        ]);

        $service = $service->refresh();

        $this->notifyStatusChange(
            $service,
            $previousStatus,
            $status,
        );

        return $service;
    }

    private function notifyStatusChange(MonitoredService $service, ?string $previousStatus, string $currentStatus): void
    {
        if ($previousStatus === null || $previousStatus === $currentStatus) {
            return;
        }

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
