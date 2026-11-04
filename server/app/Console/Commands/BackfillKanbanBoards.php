<?php

namespace App\Console\Commands;

use DomainException;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class BackfillKanbanBoards extends Command
{
    protected $signature = 'kanban:backfill-boards';

    protected $description = 'Attach legacy Kanban columns to personal boards; run with Kanban writes stopped';

    public function handle(): int
    {
        $migrated = $skipped = 0;
        $this->line('Kanban writes must remain stopped for the entire backfill and API switchover.');

        try {
            $this->assertLinks();
            $users = DB::table('kanban_columns')->select('user_id')->distinct()->orderBy('user_id')->pluck('user_id');

            foreach ($users as $userId) {
                $changed = DB::transaction(function () use ($userId) {
                    if (!DB::table('users')->where('id', $userId)->lockForUpdate()->first(['id'])) {
                        $this->stop('missing_user', $userId);
                    }
                    $columns = DB::table('kanban_columns')->where('user_id', $userId)
                        ->orderBy('id')->lockForUpdate()->get(['id', 'board_id']);

                    if ($columns->isEmpty()) {
                        return false;
                    }
                    // Lock related tasks and boards before rechecking their ownership.
                    DB::table('kanban_tasks')->where(function ($query) use ($userId, $columns) {
                        $query->where('user_id', $userId)->orWhereIn('column_id', $columns->pluck('id'));
                    })->orderBy('id')->lockForUpdate()->get(['id']);
                    DB::table('kanban_boards')->where(function ($query) use ($userId, $columns) {
                        $query->where('owner_id', $userId)->orWhereIn('id', $columns->pluck('board_id')->filter());
                    })->orderBy('id')->lockForUpdate()->get(['id']);
                    $this->assertLinks();
                    $unassigned = $columns->whereNull('board_id')->count();

                    if ($unassigned === 0) {
                        return false;
                    }

                    if ($unassigned !== $columns->count()) {
                        $this->stop('partially_assigned_columns', $userId);
                    }

                    if (DB::table('kanban_boards')->where('owner_id', $userId)->exists()) {
                        $this->stop('unassigned_columns_with_existing_boards', $userId);
                    }

                    $boardId = (string) Str::uuid();
                    $now = now();
                    DB::table('kanban_boards')->insert([
                        'id' => $boardId, 'owner_id' => $userId, 'title' => 'Общее',
                        'revision' => 0, 'created_at' => $now, 'updated_at' => $now,
                    ]);
                    $updated = DB::table('kanban_columns')->whereIn('id', $columns->pluck('id'))
                        ->whereNull('board_id')->update(['board_id' => $boardId]);

                    if ($updated !== $columns->count()) {
                        $this->stop('column_set_changed', $userId);
                    }

                    return true;
                }, 3);

                if ($changed) {
                    $migrated++;
                } else {
                    $skipped++;
                }
                $this->line(($changed ? 'MIGRATED ' : 'SKIPPED ') . $this->identifier($userId));
            }
        } catch (Throwable $error) {
            $this->error($error instanceof DomainException
                ? $error->getMessage()
                : 'Backfill failed; database error details suppressed.');
            $this->line('Previously committed users: ' . $migrated . '; skipped: ' . $skipped . '. Failed user transaction rolled back.');

            return self::FAILURE;
        }

        $this->info('Backfill complete. Migrated: ' . $migrated . '; skipped: ' . $skipped);

        return self::SUCCESS;
    }

    private function assertLinks(): void
    {
        $column = DB::table('kanban_columns as c')
            ->leftJoin('users as u', 'u.id', '=', 'c.user_id')
            ->leftJoin('kanban_boards as b', 'b.id', '=', 'c.board_id')
            ->where(function ($query) {
                $query->whereNull('u.id')->orWhere(function ($query) {
                    $query->whereNotNull('c.board_id')->where(function ($query) {
                        $query->whereNull('b.id')->orWhereColumn('b.owner_id', '!=', 'c.user_id');
                    });
                });
            })->orderBy('c.id')->first(['c.id']);

        if ($column) {
            $this->stop('invalid_column_owner_or_board', $column->id);
        }
        $task = DB::table('kanban_tasks as t')
            ->leftJoin('users as u', 'u.id', '=', 't.user_id')
            ->leftJoin('kanban_columns as c', 'c.id', '=', 't.column_id')
            ->where(function ($query) {
                $query->whereNull('u.id')->orWhereNull('c.id')->orWhereColumn('t.user_id', '!=', 'c.user_id');
            })->orderBy('t.id')->first(['t.id']);

        if ($task) {
            $this->stop('invalid_task_owner_or_column', $task->id);
        }
    }

    private function stop(string $reason, mixed $id): never
    {
        throw new DomainException('STOPPED ' . $reason . ' id=' . $this->identifier($id));
    }

    private function identifier(mixed $id): string
    {
        return is_string($id) && Str::isUuid($id) ? $id : '[invalid-id]';
    }
}
