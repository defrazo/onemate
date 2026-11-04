<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Throwable;

class CheckKanbanData extends Command
{
    protected $signature = 'kanban:check-data';

    protected $description = 'Read-only Kanban data and board integrity diagnostics';

    private array $counts = [];

    private const CATEGORIES = [
        'column_without_board' => 'WARNING',
        'column_missing_board' => 'BLOCKER',
        'column_board_owner_mismatch' => 'BLOCKER',
        'board_missing_owner' => 'BLOCKER',
        'user_without_board' => 'WARNING',
        'ambiguous_unassigned_columns' => 'BLOCKER',
        'task_board_owner_mismatch' => 'BLOCKER',
        'board_column_count' => 'WARNING',
        'board_count' => 'WARNING',
        'task_without_column' => 'BLOCKER',
        'task_missing_column' => 'BLOCKER',
        'task_owner_mismatch' => 'BLOCKER',
        'column_missing_user' => 'BLOCKER',
        'task_missing_user' => 'BLOCKER',
        'column_count' => 'WARNING',
        'task_count' => 'WARNING',
        'invalid_column_fields' => 'WARNING',
        'invalid_task_fields' => 'WARNING',
        'column_position' => 'WARNING',
        'task_position' => 'WARNING',
        'duplicate_column_position' => 'WARNING',
        'duplicate_task_position' => 'WARNING',
    ];

    public function handle(): int
    {
        $this->counts = array_fill_keys(array_keys(self::CATEGORIES), 0);
        $this->line('Kanban diagnostics: SELECT only; no data is changed.');
        $this->line('BLOCKER = ownership/link ambiguity; WARNING = preservable data requiring a decision.');
        $this->line('Counts are per record/category; one record may appear in multiple categories.');
        $this->line('Concurrent writes may affect the report; run during a quiet period.');

        try {
            $references = DB::table('kanban_columns')->select('user_id')
                ->union(DB::table('kanban_tasks')->select('user_id'))
                ->union(DB::table('kanban_boards')->select('owner_id'));
            $users = DB::query()->fromSub($references, 'refs')
                ->join('users', 'users.id', '=', 'refs.user_id')->count();
            $this->line('Users with Kanban data: ' . $users);
            $this->line('Boards: ' . DB::table('kanban_boards')->count());
            $this->line('Empty boards are permitted; legacy unassigned columns require review, not automatic repair.');
            $this->line('Columns: ' . DB::table('kanban_columns')->count());
            $this->line('Tasks: ' . DB::table('kanban_tasks')->count());

            $columnCounts = DB::table('kanban_columns')->select('user_id')
                ->selectRaw('COUNT(*) AS total')->groupBy('user_id');

            foreach (DB::query()->fromSub($references, 'refs')
                ->leftJoinSub($columnCounts, 'counts', 'counts.user_id', '=', 'refs.user_id')
                ->whereNotExists(function ($query) {
                    $query->selectRaw('1')->from('kanban_boards')->whereColumn('owner_id', 'refs.user_id');
                })->select('refs.user_id', 'counts.total')->orderBy('refs.user_id')->cursor() as $row) {
                $count = (int) $row->total;

                if ($count > 6) {
                    $this->issue('column_count', 'user', $row->user_id, 'columns=' . $count . '; maximum 6');
                }
            }

            $boardCounts = DB::table('kanban_boards')->select('owner_id')
                ->selectRaw('COUNT(*) AS total')->groupBy('owner_id');
            $unassignedCounts = DB::table('kanban_columns')->whereNull('board_id')->select('user_id')
                ->selectRaw('COUNT(*) AS total')->groupBy('user_id');

            foreach (DB::query()->fromSub($columnCounts, 'columns')
                ->leftJoinSub($boardCounts, 'boards', 'boards.owner_id', '=', 'columns.user_id')
                ->leftJoinSub($unassignedCounts, 'unassigned', 'unassigned.user_id', '=', 'columns.user_id')
                ->select('columns.user_id', 'boards.total as board_count', 'unassigned.total as unassigned_count')
                ->orderBy('columns.user_id')->cursor() as $row) {
                if ((int) $row->board_count === 0) {
                    $this->issue('user_without_board', 'user', $row->user_id, 'has columns but no owned board; no automatic assignment');
                } elseif ($row->board_count > 1 && $row->unassigned_count > 0) {
                    $this->issue('ambiguous_unassigned_columns', 'user', $row->user_id, 'multiple owned boards and unassigned columns; target board is ambiguous');
                }
            }

            foreach (DB::query()->fromSub($boardCounts, 'counts')->where('total', '>', 10)
                ->orderBy('owner_id')->cursor() as $row) {
                $this->issue('board_count', 'user', $row->owner_id, 'boards=' . $row->total . '; maximum 10');
            }
            $boardColumnCounts = DB::table('kanban_columns')->select('board_id')
                ->selectRaw('COUNT(*) AS total')->groupBy('board_id');

            foreach (DB::table('kanban_boards as b')
                ->leftJoin('users as u', 'u.id', '=', 'b.owner_id')
                ->leftJoinSub($boardColumnCounts, 'counts', 'counts.board_id', '=', 'b.id')
                ->select('b.id', 'u.id as existing_owner', 'counts.total')->orderBy('b.id')->cursor() as $row) {
                if ($row->existing_owner === null) {
                    $this->issue('board_missing_owner', 'board', $row->id, 'owner does not exist');
                }
                $count = (int) $row->total;

                if ($count > 6) {
                    $this->issue('board_column_count', 'board', $row->id, 'columns=' . $count . '; maximum 6; empty and partially built boards are permitted');
                }
            }

            $taskCounts = DB::table('kanban_tasks')->select('column_id')
                ->selectRaw('COUNT(*) AS total')->groupBy('column_id');

            foreach (DB::table('kanban_columns as c')
                ->leftJoin('users as u', 'u.id', '=', 'c.user_id')
                ->leftJoin('kanban_boards as b', 'b.id', '=', 'c.board_id')
                ->leftJoinSub($taskCounts, 'counts', 'counts.column_id', '=', 'c.id')
                ->select('c.*', 'u.id as existing_user', 'b.id as existing_board', 'b.owner_id as board_owner', 'counts.total as task_count')
                ->orderBy('c.id')->cursor() as $row) {
                if ($row->existing_user === null) {
                    $this->issue('column_missing_user', 'column', $row->id, 'owner does not exist');
                }

                if ($row->board_id === null) {
                    $this->issue('column_without_board', 'column', $row->id, 'board_id is null; legacy API can create unassigned columns');
                } elseif ($row->existing_board === null) {
                    $this->issue('column_missing_board', 'column', $row->id, 'board does not exist');
                } elseif ($row->user_id !== $row->board_owner) {
                    $this->issue('column_board_owner_mismatch', 'column', $row->id, 'column and board owners differ');
                }

                if ($row->task_limit !== null && is_numeric($row->task_limit) && $row->task_count > $row->task_limit) {
                    $this->issue('task_count', 'column', $row->id, 'task count exceeds non-null limit');
                }
                $this->validateFields('column', $row, [
                    'title' => ['required', 'string', 'max:20'],
                    'task_limit' => ['nullable', 'integer', 'min:1'],
                    'color' => ['nullable', 'string', 'max:50'],
                ]);
                $this->checkPosition('column', $row);
            }

            foreach (DB::table('kanban_tasks as t')
                ->leftJoin('kanban_columns as c', 'c.id', '=', 't.column_id')
                ->leftJoin('kanban_boards as b', 'b.id', '=', 'c.board_id')
                ->leftJoin('users as u', 'u.id', '=', 't.user_id')
                ->select('t.*', 'c.id as existing_column', 'c.user_id as column_owner', 'u.id as existing_user', 'b.id as existing_board', 'b.owner_id as board_owner')
                ->orderBy('t.id')->cursor() as $row) {
                if ($row->column_id === null) {
                    $this->issue('task_without_column', 'task', $row->id, 'column_id is null');
                } elseif ($row->existing_column === null) {
                    $this->issue('task_missing_column', 'task', $row->id, 'column does not exist');
                } elseif ($row->user_id !== $row->column_owner) {
                    $this->issue('task_owner_mismatch', 'task', $row->id, 'task and column owners differ');
                }

                if ($row->existing_user === null) {
                    $this->issue('task_missing_user', 'task', $row->id, 'owner does not exist');
                }

                if ($row->existing_board !== null && $row->user_id !== $row->board_owner) {
                    $this->issue('task_board_owner_mismatch', 'task', $row->id, 'task and board owners differ through column');
                }
                $rules = [
                    'title' => ['required', 'string', 'max:60'],
                    'description' => ['nullable', 'string', 'max:300'],
                    'status' => ['nullable', 'string', Rule::in(['active', 'paused', 'waiting'])],
                    'priority' => ['nullable', 'string', Rule::in(['low', 'medium', 'high'])],
                    'start_date' => ['nullable', 'date'],
                    'end_date' => ['nullable', 'date'],
                    'completed' => ['required', 'boolean'],
                ];

                if ($row->start_date !== null && $row->end_date !== null) {
                    $rules['end_date'][] = 'after_or_equal:start_date';
                }
                $this->validateFields('task', $row, $rules);
                $this->checkPosition('task', $row);
            }

            $this->checkDuplicates('kanban_columns', 'board_id', 'column');
            $this->checkDuplicates('kanban_columns', 'user_id', 'column', true);
            $this->checkDuplicates('kanban_tasks', 'column_id', 'task');
        } catch (Throwable) {
            $this->error('Diagnostics incomplete. Check connection/schema privately; database error details are suppressed.');

            return self::INVALID;
        }

        $this->table(['Severity', 'Category', 'Count'], array_map(
            fn ($category) => [self::CATEGORIES[$category], $category, $this->counts[$category]],
            array_keys(self::CATEGORIES),
        ));
        $blockers = $warnings = 0;

        foreach ($this->counts as $category => $count) {
            if (self::CATEGORIES[$category] === 'BLOCKER') {
                $blockers += $count;
            } else {
                $warnings += $count;
            }
        }
        $this->line('Blockers: ' . $blockers . '; warnings: ' . $warnings);
        $this->line($blockers + $warnings === 0
            ? 'READY: data is ready for automatic migration.'
            : 'REVIEW REQUIRED: a separate decision is needed; no data has been changed.');

        return $blockers > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function issue(string $category, string $entity, mixed $id, string $reason): void
    {
        $this->counts[$category]++;
        $identifier = is_string($id) && preg_match('/^[0-9a-f-]{36}$/i', $id) ? $id : '[invalid-id]';
        $this->line(self::CATEGORIES[$category] . ' ' . $category . ' ' . $entity . '=' . $identifier . ' ' . $reason);
    }

    private function validateFields(string $entity, object $row, array $rules): void
    {
        $validator = Validator::make((array) $row, $rules);

        if ($validator->fails()) {
            $this->issue('invalid_' . $entity . '_fields', $entity, $row->id,
                'invalid fields: ' . implode(', ', array_keys($validator->failed())));
        }
    }

    private function checkPosition(string $entity, object $row): void
    {
        if ($row->position === null || !is_numeric($row->position)
            || !is_finite((float) $row->position) || abs((float) $row->position) > 99999999.9999) {
            $this->issue($entity . '_position', $entity, $row->id, 'position is null, non-finite, non-numeric or outside decimal(12,4) range');
        }
    }

    private function checkDuplicates(string $table, string $group, string $entity, bool $unassignedOnly = false): void
    {
        $duplicates = DB::table($table)->select($group, 'position')
            ->whereNotNull($group)->whereNotNull('position')
            ->groupBy($group, 'position')->havingRaw('COUNT(*) > 1');

        if ($unassignedOnly) {
            $duplicates->whereNull('board_id');
        }

        foreach (DB::table($table . ' as records')
            ->joinSub($duplicates, 'duplicates', function ($join) use ($group) {
                $join->on('records.' . $group, '=', 'duplicates.' . $group)
                    ->on('records.position', '=', 'duplicates.position');
            })->when($unassignedOnly, fn ($query) => $query->whereNull('records.board_id'))
            ->select('records.id')->orderBy('records.id')->cursor() as $row) {
            $this->issue('duplicate_' . $entity . '_position', $entity, $row->id, 'position is repeated within ' . $group);
        }
    }
}
