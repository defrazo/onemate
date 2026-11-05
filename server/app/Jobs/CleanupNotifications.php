<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Notifications\DatabaseNotification;

class CleanupNotifications implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        DatabaseNotification::query()
            ->select('notifiable_type', 'notifiable_id')
            ->distinct()
            ->get()
            ->each(function ($notifiable) {
                $ids = DatabaseNotification::query()
                    ->where('notifiable_type', $notifiable->notifiable_type)
                    ->where('notifiable_id', $notifiable->notifiable_id)
                    ->orderByDesc('created_at')
                    ->orderByDesc('id')
                    ->skip(20)
                    ->pluck('id');

                if ($ids->isNotEmpty()) {
                    DatabaseNotification::query()
                        ->whereIn('id', $ids)
                        ->delete();
                }
            });
    }
}
