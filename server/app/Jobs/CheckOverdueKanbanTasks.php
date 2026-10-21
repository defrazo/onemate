<?php

namespace App\Jobs;

use App\Services\Kanban\OverdueTaskService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckOverdueKanbanTasks implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 60;

    public function handle(OverdueTaskService $service): void
    {
        $service->check();
    }
}
