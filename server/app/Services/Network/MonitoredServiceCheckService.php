<?php

namespace App\Services\Network;

use App\Models\MonitoredService;

class MonitoredServiceCheckService
{
    public function __construct(private readonly ServiceCheckService $serviceCheckService)
    {
    }

    public function check(MonitoredService $service): MonitoredService
    {
        $result = $this->serviceCheckService->check($service->url);
        $checkedAt = now();

        $service->update([
            'last_status' => $result['status'],
            'last_status_code' => $result['statusCode'],
            'last_response_time' => $result['responseTime'],
            'last_checked_at' => $checkedAt,
        ]);

        $service->checks()->create([
            'status' => $result['status'],
            'status_code' => $result['statusCode'],
            'response_time' => $result['responseTime'],
            'checked_at' => $checkedAt,
        ]);

        return $service->refresh();
    }
}
