<?php

use App\Jobs\CheckMonitoredService;
use App\Models\MonitoredService;
use App\Models\MonitoringCheck;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    MonitoredService::query()
        ->where('is_active', true)
        ->select('id')
        ->chunkById(100, function ($services) {
            foreach ($services as $service) {
                CheckMonitoredService::dispatch($service->id);
            }
        });
})
    ->name('check-monitored-services')
    ->everyFifteenMinutes()
    ->withoutOverlapping();

Schedule::call(function () {
    MonitoringCheck::query()
        ->where('checked_at', '<', now()->subDays(5))
        ->delete();
})
    ->name('cleanup-monitoring-checks')
    ->dailyAt('03:00')
    ->withoutOverlapping();
