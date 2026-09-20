<?php

namespace App\Services\Network;

use App\Models\MonitoredService;

class MonitoredServiceCheckService
{
    public function __construct(private readonly AddressCheckService $addressCheckService)
    {
    }

    public function check(MonitoredService $service, bool $recordHistory = false): MonitoredService
    {
        $result = $this->addressCheckService->check($service->url);
        $checkedAt = now();

        $service->update([
            'last_status' => $result['status'],
            'last_status_code' => $result['statusCode'],
            'last_response_time' => $result['responseTime'],
            'last_checked_at' => $checkedAt,
        ]);

        if ($recordHistory) {
            $service->checks()->create([
                'status' => $result['status'],
                'status_code' => $result['statusCode'],
                'response_time' => $result['responseTime'],
                'checked_at' => $checkedAt,
            ]);
        }

        return $service->refresh();
    }
}
