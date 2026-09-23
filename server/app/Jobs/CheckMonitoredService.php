<?php

namespace App\Jobs;

use App\Models\MonitoredService;
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

        $checkService->check($service);
    }
}
