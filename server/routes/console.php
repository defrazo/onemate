<?php

use App\Jobs\CheckMonitoredService;
use App\Jobs\CheckOverdueKanbanTasks;
use App\Models\Network\MonitoredService;
use App\Models\Network\MonitoringCheck;
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

Schedule::job(new CheckOverdueKanbanTasks)
    ->dailyAt('00:05')
    ->withoutOverlapping();
