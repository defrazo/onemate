<?php

namespace App\Services\Kanban;

use App\Models\Kanban\KanbanTask;
use App\Models\User\User;
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
            ->select('id', 'user_id')
            ->chunkById(100, function ($tasks) use ($today) {
                foreach ($tasks as $task) {
                    DB::transaction(function () use ($task, $today) {
                        $user = User::query()->whereKey($task->user_id)->lockForUpdate()->first();

                        if ($user === null) {
                            return;
                        }

                        $board = $user->ownedKanbanBoards()
                            ->whereHas('columns', function ($columns) use ($user, $task) {
                                $columns->where('user_id', $user->id)
                                    ->whereHas('tasks', fn ($tasks) => $tasks->whereKey($task->id)->where('user_id', $user->id));
                            })
                            ->lockForUpdate()
                            ->first();

                        if ($board === null) {
                            return;
                        }

                        $currentTask = KanbanTask::query()
                            ->whereKey($task->id)
                            ->where('user_id', $user->id)
                            ->whereHas('column', fn ($column) => $column->where('board_id', $board->id)->where('user_id', $user->id))
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

                        $kanbanNotificationsEnabled = $user->profile?->kanban_notifications_enabled ?? true;

                        if (!$kanbanNotificationsEnabled) {
                            return;
                        }

                        $user->notify(
                            new TaskOverdueNotification($currentTask),
                        );

                        DB::table('kanban_tasks')->where('id', $currentTask->id)->update([
                            'overdue_notified_date' => $currentTask->end_date->toDateString(),
                        ]);
                    });
                }
            });
    }
}
