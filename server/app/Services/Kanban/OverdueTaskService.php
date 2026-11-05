<?php

namespace App\Services\Kanban;

use App\Models\Kanban\KanbanTask;
use App\Models\User\User;
use App\Notifications\Kanban\KanbanDeadlineEmailNotification;
use App\Notifications\Kanban\TaskDueSoonNotification;
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
            ->where(function ($query) use ($today) {
                $query->where(function ($overdue) use ($today) {
                    $overdue
                        ->whereDate('end_date', '<', $today)
                        ->where(function ($unnotified) {
                            $unnotified
                                ->whereNull('overdue_notified_date')
                                ->orWhereColumn('overdue_notified_date', '!=', 'end_date')
                                ->orWhereNull('overdue_email_queued_date')
                                ->orWhereColumn('overdue_email_queued_date', '!=', 'end_date');
                        });
                })->orWhere(function ($reminder) use ($today) {
                    $reminder
                        ->where(function ($unnotified) {
                            $unnotified
                                ->whereNull('reminder_notified_date')
                                ->orWhereColumn('reminder_notified_date', '!=', 'end_date')
                                ->orWhereNull('reminder_email_queued_date')
                                ->orWhereColumn('reminder_email_queued_date', '!=', 'end_date');
                        })
                        ->where(function ($dates) use ($today) {
                            foreach ([0, 1, 2, 3, 7] as $days) {
                                $dates->orWhere(function ($date) use ($today, $days) {
                                    $date
                                        ->where('remind_before_days', $days)
                                        ->whereDate('end_date', $today->copy()->addDays($days));
                                });
                            }
                        });
                });
            })
            ->select('id', 'user_id')
            ->chunkById(100, function ($tasks) use ($today) {
                foreach ($tasks as $task) {
                    DB::transaction(function () use ($task, $today) {
                        $user = User::query()
                            ->whereKey($task->user_id)
                            ->lockForUpdate()
                            ->first();

                        if ($user === null) {
                            return;
                        }

                        $board = $user->ownedKanbanBoards()
                            ->whereHas('columns', function ($columns) use ($user, $task) {
                                $columns
                                    ->where('user_id', $user->id)
                                    ->whereHas('tasks', fn ($tasks) => $tasks
                                        ->whereKey($task->id)
                                        ->where('user_id', $user->id));
                            })
                            ->lockForUpdate()
                            ->first();

                        if ($board === null) {
                            return;
                        }

                        $currentTask = KanbanTask::query()
                            ->whereKey($task->id)
                            ->where('user_id', $user->id)
                            ->whereHas('column', fn ($column) => $column
                                ->where('board_id', $board->id)
                                ->where('user_id', $user->id))
                            ->lockForUpdate()
                            ->first();

                        if (
                            $currentTask === null ||
                            $currentTask->completed ||
                            $currentTask->end_date === null
                        ) {
                            return;
                        }

                        $overdue = $currentTask->end_date->lt($today);

                        if (!$overdue && (
                            $currentTask->remind_before_days === null ||
                            !$currentTask->end_date->copy()->subDays($currentTask->remind_before_days)->isSameDay($today)
                        )) {
                            return;
                        }

                        $notifiedColumn = $overdue ? 'overdue_notified_date' : 'reminder_notified_date';
                        $emailColumn = $overdue ? 'overdue_email_queued_date' : 'reminder_email_queued_date';
                        $profile = $user->profile;

                        if (($profile?->kanban_notifications_enabled ?? true) && (
                            $currentTask->$notifiedColumn === null ||
                            !$currentTask->end_date->isSameDay($currentTask->$notifiedColumn)
                        )) {
                            $user->notify($overdue
                                ? new TaskOverdueNotification($currentTask, $board->title)
                                : new TaskDueSoonNotification($currentTask, $board->title));

                            DB::table('kanban_tasks')->where('id', $currentTask->id)->update([
                                $notifiedColumn => $currentTask->end_date->toDateString(),
                            ]);
                        }

                        if (($profile?->kanban_email_notifications_enabled ?? false) && (
                            $currentTask->$emailColumn === null ||
                            !$currentTask->end_date->isSameDay($currentTask->$emailColumn)
                        )) {
                            try {
                                DB::transaction(function () use ($user, $currentTask, $board, $overdue, $emailColumn) {
                                    $user->notify(new KanbanDeadlineEmailNotification(
                                        $currentTask->title,
                                        $board->title,
                                        $currentTask->end_date->toDateString(),
                                        $overdue,
                                    ));

                                    DB::table('kanban_tasks')->where('id', $currentTask->id)->update([
                                        $emailColumn => $currentTask->end_date->toDateString(),
                                    ]);
                                });
                            } catch (\Throwable $exception) {
                                report($exception);
                            }
                        }
                    });
                }
            });
    }
}
