<?php

namespace App\Services\Kanban;

use App\Models\Kanban\KanbanTask;
use App\Notifications\Kanban\TaskOverdueNotification;
use Illuminate\Support\Facades\DB;

class OverdueTaskService
{
    public function check(): void
    {
        $today = today();

        KanbanTask::query()
            ->where('completed', false)
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', $today)
            ->where(function ($query) {
                $query->whereNull('overdue_notified_date')
                    ->orWhereColumn('overdue_notified_date', '!=', 'end_date');
            })
            ->select('id')
            ->chunkById(100, function ($tasks) use ($today) {
                foreach ($tasks as $task) {
                    DB::transaction(function () use ($task, $today) {
                        $currentTask = KanbanTask::query()
                            ->whereKey($task->id)
                            ->lockForUpdate()
                            ->first();

                        if (
                            $currentTask === null ||
                            $currentTask->completed ||
                            $currentTask->end_date === null ||
                            $currentTask->end_date->gte($today) ||
                            $currentTask->overdue_notified_date !== null &&
                                $currentTask->end_date->isSameDay(
                                    $currentTask->overdue_notified_date,
                                )
                        ) {
                            return;
                        }

                        $user = $currentTask->user;

                        if ($user === null) {
                            return;
                        }

                        $kanbanNotificationsEnabled = $user->profile?->kanban_notifications_enabled ?? true;

                        if (!$kanbanNotificationsEnabled) {
                            return;
                        }

                        $user->notify(
                            new TaskOverdueNotification($currentTask),
                        );

                        $currentTask->forceFill([
                            'overdue_notified_date' => $currentTask->end_date,
                        ])->save();
                    });
                }
            });
    }
}
