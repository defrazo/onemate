<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Models\KanbanTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KanbanTaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tasks = $request->user()
            ->kanbanTasks()
            ->orderBy('position')
            ->get();

        return response()->json([
            'tasks' => $tasks,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'column_id' => [
                'required',
                'uuid',
                Rule::exists('kanban_columns', 'id')
                    ->where('user_id', $request->user()->getKey()),
            ],
            'title' => ['required', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:300'],
            'status' => [
                'required',
                'string',
                Rule::in(['active', 'paused', 'waiting']),
            ],
            'priority' => [
                'required',
                'string',
                Rule::in(['low', 'medium', 'high']),
            ],
            'position' => ['required', 'numeric'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'completed' => ['required', 'boolean'],
        ]);

        $task = $request->user()
            ->kanbanTasks()
            ->create($data);

        return response()->json([
            'task' => $task,
        ], 201);
    }

    public function update(Request $request, KanbanTask $task): JsonResponse
    {
        $task = $this->resolveTask($request, $task);

        $data = $request->validate([
            'column_id' => [
                'sometimes',
                'required',
                'uuid',
                Rule::exists('kanban_columns', 'id')
                    ->where('user_id', $request->user()->getKey()),
            ],

            'title' => ['sometimes', 'required', 'string', 'max:60'],
            'description' => ['sometimes', 'nullable', 'string', 'max:300'],
            'status' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['active', 'paused', 'waiting']),
            ],
            'priority' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['low', 'medium', 'high']),
            ],
            'position' => ['sometimes', 'numeric'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date'],
            'completed' => ['sometimes', 'boolean'],
        ]);

        $startDate = $data['start_date'] ?? $task->start_date;
        $endDate = array_key_exists('end_date', $data)
            ? $data['end_date']
            : $task->end_date;

        if (
            $startDate &&
            $endDate &&
            $endDate < $startDate
        ) {
            return response()->json([
                'code' => 'INVALID_DATE_RANGE',
            ], 422);
        }

        $task->update($data);

        return response()->json([
            'task' => $task->fresh(),
        ]);
    }

    public function move(Request $request, KanbanTask $task): JsonResponse
    {
        $task = $this->resolveTask($request, $task);

        $data = $request->validate([
            'column_id' => [
                'required',
                'uuid',
                Rule::exists('kanban_columns', 'id')
                    ->where('user_id', $request->user()->getKey()),
            ],
            'position' => ['required', 'numeric'],
        ]);

        $task->update([
            'column_id' => $data['column_id'],
            'position' => $data['position'],
        ]);

        return response()->json([
            'task' => $task->fresh(),
        ]);
    }

    public function destroy(Request $request, KanbanTask $task): JsonResponse
    {
        $task = $this->resolveTask($request, $task);

        $task->delete();

        return response()->json([
            'code' => 'TASK_DELETED',
        ]);
    }

    private function resolveTask(Request $request, KanbanTask $task): KanbanTask
    {
        return $request->user()
            ->kanbanTasks()
            ->whereKey($task->getKey())
            ->firstOrFail();
    }
}
