<?php

namespace App\Services\Network;

use App\Models\Network\MonitoredService;
use App\Notifications\Network\NetworkStatusEmailNotification;
use App\Notifications\Network\ServiceDownNotification;
use App\Notifications\Network\ServiceRecoveredNotification;
use Illuminate\Support\Facades\DB;

class MonitoredServiceCheckService
{
    public function __construct(
        private readonly ServiceCheckService $serviceCheckService,
        private readonly PortCheckService $portCheckService,
    ) {
    }

    public function check(MonitoredService $service): MonitoredService
    {
        $checkedAt = now();

        if ($service->type === 'http') {
            $result = $this->serviceCheckService->check(
                $service->url,
                $service->check_via,
            );

            $status = $result['status'];
            $statusCode = $result['statusCode'];
            $responseTime = $result['responseTime'];
        } else {
            $result = $this->portCheckService->check(
                $service->host,
                $service->port,
                $service->check_via,
            );

            $status = $result['status'] === 'open'
                ? 'up'
                : 'down';

            $statusCode = null;
            $responseTime = $result['responseTime'];
        }

        return DB::transaction(function () use ($service, $status, $statusCode, $responseTime, $checkedAt) {
            $current = MonitoredService::whereKey($service->id)->lockForUpdate()->first();

            if ($current === null || !$current->is_active || $current->last_checked_at?->gt($checkedAt)) {
                return $current ?? $service;
            }

            $previousStatus = $current->last_status;

            $current->update([
                'last_status' => $status,
                'last_status_code' => $statusCode,
                'last_response_time' => $responseTime,
                'last_checked_at' => $checkedAt,
            ]);

            $current->checks()->create([
                'status' => $status,
                'status_code' => $statusCode,
                'response_time' => $responseTime,
                'checked_at' => $checkedAt,
            ]);

            $this->notifyStatusChange($current, $previousStatus, $status);

            return $current;
        });
    }

    private function notifyStatusChange(MonitoredService $service, ?string $previousStatus, string $currentStatus): void
    {
        if ($previousStatus === null || $previousStatus === $currentStatus) {
            return;
        }

        $user = $service->user;

        if ($user->profile?->network_notifications_enabled ?? true) {
            if ($previousStatus === 'up' && $currentStatus === 'down') {
                $user->notify(new ServiceDownNotification($service));
            }

            if ($previousStatus === 'down' && $currentStatus === 'up') {
                $user->notify(new ServiceRecoveredNotification($service));
            }
        }

        if ($user->profile?->network_email_notifications_enabled ?? false) {
            try {
                DB::transaction(fn () => $user->notify(
                    new NetworkStatusEmailNotification($service->name, $currentStatus),
                ));
            } catch (\Throwable $exception) {
                report($exception);
            }
        }
    }
}
