<?php

namespace App\Services\Kanban;

use App\Models\Kanban\KanbanBoard;
use App\Models\Kanban\KanbanColumn;
use App\Models\Kanban\KanbanTask;
use App\Models\User\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KanbanBoardService
{
    public function initialize(User $user): array
    {
        return $this->createBoard($user, null);
    }

    public function create(User $user, string $title): array
    {
        return $this->createBoard($user, $title);
    }

    public function list(User $user): array
    {
        $boards = $user->ownedKanbanBoards()
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->map(fn ($board) => $board->attributesToArray())
            ->all();

        return ['boards' => $boards];
    }

    public function show(User $user, string $id): array
    {
        return DB::transaction(function () use ($user, $id) {
            $board = $user->ownedKanbanBoards()
                ->whereKey($id)
                ->sharedLock()
                ->firstOrFail();

            return $this->result($board, false)['data'];
        });
    }

    public function rename(User $user, string $id, int $revision, string $title): array
    {
        return $this->changeBoard(
            $user,
            $id,
            $revision,
            fn ($board) => $board->update(['title' => $title]),
        );
    }

    public function delete(User $user, string $id, int $revision): array
    {
        return DB::transaction(function () use ($user, $id, $revision) {
            $owner = User::whereKey($user->getKey())->lockForUpdate()->firstOrFail();
            $board = $owner->ownedKanbanBoards()->whereKey($id)->lockForUpdate()->firstOrFail();

            $this->assertRevision($board, $revision);

            if ($owner->ownedKanbanBoards()->count() <= 1) {
                abort(response()->json([
                    'code' => 'LAST_BOARD',
                    'message' => 'Нельзя удалить последнюю собственную доску',
                ], 409));
            }

            $board->delete();

            return ['deleted_board_id' => $id];
        }, 3);
    }

    public function createColumn(User $user, string $boardId, int $revision, array $data): array
    {
        return $this->changeColumns($user, $boardId, $revision, null, function ($board) use ($data) {
            if ($board->columns()->count() >= 6) {
                abort(response()->json([
                    'code' => 'COLUMN_LIMIT_REACHED',
                    'message' => 'Максимум 6 колонок',
                ], 409));
            }

            $column = $board->columns()->make([
                ...$data,
                'unique_key' => (string) Str::uuid(),
            ]);

            $column->user_id = $board->owner_id;
            $column->save();
        });
    }

    public function updateColumn(User $user, string $boardId, string $columnId, int $revision, array $data): array
    {
        return $this->changeColumns(
            $user,
            $boardId,
            $revision,
            $columnId,
            fn ($board, $column) => $column->update($data),
        );
    }

    public function deleteColumn(User $user, string $boardId, string $columnId, int $revision): array
    {
        return $this->changeColumns(
            $user,
            $boardId,
            $revision,
            $columnId,
            fn ($board, $column) => $column->delete(),
        );
    }

    public function reorderColumns(User $user, string $boardId, int $revision, array $ids): array
    {
        return $this->changeColumns($user, $boardId, $revision, null, function ($board) use ($ids) {
            $columns = $board->columns()->get()->keyBy('id');

            foreach ($ids as $id) {
                abort_unless($columns->has($id), 404);
            }

            if (count($ids) !== $columns->count()) {
                abort(response()->json([
                    'message' => 'Передайте полный порядок колонок доски',
                ], 422));
            }

            foreach ($ids as $index => $id) {
                $columns[$id]->update(['position' => ($index + 1) * 1000]);
            }
        });
    }

    public function createTask(User $user, string $boardId, int $revision, array $data): array
    {
        return $this->changeBoard($user, $boardId, $revision, function ($board) use ($data) {
            $column = $board->columns()->findOrFail($data['column_id']);

            $this->checkTaskCapacity($column);

            $data['description'] ??= '';

            $this->checkTaskDates(
                $data['start_date'] ?? null,
                $data['end_date'] ?? null,
            );

            $task = $column->tasks()->make($data);
            $task->user_id = $board->owner_id;
            $task->save();
        });
    }

    public function updateTask(User $user, string $boardId, string $taskId, int $revision, array $data): array
    {
        return $this->changeBoard($user, $boardId, $revision, function ($board) use ($taskId, $data) {
            $task = $this->boardTask($board, $taskId);

            if (isset($data['column_id'])) {
                $column = $board->columns()->findOrFail($data['column_id']);

                if ($column->id !== $task->column_id) {
                    $this->checkTaskCapacity($column);
                }
            }

            if (array_key_exists('description', $data)) {
                $data['description'] ??= '';
            }

            $this->checkTaskDates(
                array_key_exists('start_date', $data) ? $data['start_date'] : $task->start_date,
                array_key_exists('end_date', $data) ? $data['end_date'] : $task->end_date,
            );

            $task->fill($data);

            if ($task->isDirty(['end_date', 'remind_before_days'])) {
                $task->reminder_notified_date = null;
                $task->reminder_email_queued_date = null;
            }

            $task->save();
        });
    }

    public function deleteTask(User $user, string $boardId, string $taskId, int $revision): array
    {
        return $this->changeBoard(
            $user,
            $boardId,
            $revision,
            fn ($board) => $this->boardTask($board, $taskId)->delete(),
        );
    }

    public function moveTask(User $user, string $boardId, string $taskId, int $revision, string $columnId, float $position): array
    {
        return $this->changeBoard($user, $boardId, $revision, function ($board) use ($taskId, $columnId, $position) {
            $task = $this->boardTask($board, $taskId);
            $column = $board->columns()->findOrFail($columnId);

            if ($column->id !== $task->column_id) {
                $this->checkTaskCapacity($column);
            }

            $task->update([
                'column_id' => $column->id,
                'position' => $position,
            ]);
        });
    }

    private function createBoard(User $user, ?string $title): array
    {
        return DB::transaction(function () use ($user, $title) {
            $owner = User::whereKey($user->getKey())->lockForUpdate()->firstOrFail();
            $first = $owner->ownedKanbanBoards()->orderBy('created_at')->orderBy('id')->first();

            if ($title === null && $first) {
                return $this->result($first, false);
            }

            if ($title !== null && !$first) {
                abort(response()->json([
                    'code' => 'KANBAN_NOT_INITIALIZED',
                    'message' => 'Сначала инициализируйте Kanban',
                ], 409));
            }

            if ($owner->ownedKanbanBoards()->count() >= 10) {
                abort(response()->json([
                    'code' => 'BOARD_LIMIT_REACHED',
                    'message' => 'Максимум 10 собственных досок',
                ], 409));
            }

            $board = $owner->ownedKanbanBoards()->create([
                'title' => $title ?? 'Общее',
            ]);

            if ($title === null) {
                $day = CarbonImmutable::today(config('app.timezone'));
                $columnIds = [];

                foreach (KanbanDefaults::columns() as $data) {
                    $column = $owner->kanbanColumns()->make([
                        ...$data,
                        'unique_key' => (string) Str::uuid(),
                    ]);

                    $board->columns()->save($column);
                    $columnIds[] = $column->id;
                }

                foreach (KanbanDefaults::tasks($columnIds, $day) as $data) {
                    $owner->kanbanTasks()->create($data);
                }
            }

            return $this->result($board->refresh(), true);
        }, 3);
    }

    private function changeBoard(User $user, string $boardId, int $revision, callable $operation): array
    {
        return DB::transaction(function () use ($user, $boardId, $revision, $operation) {
            $owner = User::whereKey($user->getKey())->lockForUpdate()->firstOrFail();
            $board = $owner->ownedKanbanBoards()->whereKey($boardId)->lockForUpdate()->firstOrFail();

            $this->assertRevision($board, $revision);

            $operation($board);
            $board->increment('revision');

            return $this->result($board, false)['data'];
        });
    }

    private function changeColumns(User $user, string $boardId, int $revision, ?string $columnId, callable $operation): array
    {
        return $this->changeBoard($user, $boardId, $revision, function ($board) use ($columnId, $operation) {
            $column = $columnId === null
                ? null
                : $board->columns()->findOrFail($columnId);

            $operation($board, $column);
        });
    }

    private function boardTask(KanbanBoard $board, string $id): KanbanTask
    {
        return KanbanTask::whereHas(
            'column',
            fn ($query) => $query->where('board_id', $board->id),
        )->findOrFail($id);
    }

    private function checkTaskCapacity(KanbanColumn $column): void
    {
        if ($column->task_limit !== null && $column->tasks()->count() >= $column->task_limit) {
            abort(response()->json([
                'code' => 'TASK_LIMIT_REACHED',
                'message' => 'Достигнут лимит задач колонки',
            ], 409));
        }
    }

    private function checkTaskDates(mixed $start, mixed $end): void
    {
        if ($start !== null && $end !== null && CarbonImmutable::parse($end)->lt(CarbonImmutable::parse($start))) {
            abort(response()->json([
                'code' => 'INVALID_DATE_RANGE',
                'message' => 'Дата окончания раньше начала',
            ], 422));
        }
    }

    private function assertRevision(KanbanBoard $board, int $revision): void
    {
        if ($board->revision !== $revision) {
            abort(response()->json([
                'code' => 'BOARD_REVISION_CONFLICT',
                'message' => 'Доска изменена. Обновите данные и повторите действие',
                'current_revision' => $board->revision,
            ], 409));
        }
    }

    private function result(KanbanBoard $board, bool $created): array
    {
        $board->load([
            'columns' => fn ($query) => $query->orderBy('position')->orderBy('id'),
            'columns.tasks' => fn ($query) => $query->orderBy('position')->orderBy('id'),
        ]);

        return [
            'created' => $created,
            'data' => [
                'board' => $board->attributesToArray(),
                'columns' => $board->columns
                    ->map(fn ($column) => $column->attributesToArray())
                    ->all(),
                'tasks' => $board->columns
                    ->flatMap(fn ($column) => $column->tasks)
                    ->map(fn ($task) => $task->attributesToArray())
                    ->values()
                    ->all(),
            ],
        ];
    }
}
