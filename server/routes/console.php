<?php

use App\Jobs\CheckMonitoredService;
use App\Jobs\CheckOverdueKanbanTasks;
use App\Jobs\CleanupNotifications;
use App\Models\Network\MonitoredService;
use App\Models\Network\MonitoringCheck;
use App\Services\Assistant\AssistantService;
use Illuminate\Support\Facades\Schedule;

Schedule::call(fn () => app(AssistantService::class)->recoverExpired())
    ->name('recover-assistant-generations')
    ->everyMinute()
    ->withoutOverlapping();

Schedule::call(fn () => app(AssistantService::class)->cleanupArchives())
    ->name('cleanup-assistant-archive')
    ->weeklyOn(0, '04:00')
    ->withoutOverlapping();

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
        ->where('checked_at', '<', now()->subDays(2))
        ->delete();
})
    ->name('cleanup-monitoring-checks')
    ->dailyAt('02:00')
    ->withoutOverlapping();

Schedule::job(new CheckOverdueKanbanTasks)
    ->twiceDaily(6, 18)
    ->withoutOverlapping();

Schedule::job(new CleanupNotifications)
    ->weeklyOn(0, '03:30')
    ->withoutOverlapping();
