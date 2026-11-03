<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\KanbanTaskRequest;
use App\Services\Kanban\KanbanBoardService;
use Illuminate\Http\JsonResponse;

class KanbanBoardTaskController extends Controller
{
    public function store(KanbanTaskRequest $request, string $board, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->createTask(
            $request->user(),
            $board,
            (int) $request->validated('revision'),
            $request->safe()->except('revision'),
        ), 201);
    }

    public function update(KanbanTaskRequest $request, string $board, string $task, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->updateTask(
            $request->user(),
            $board,
            $task,
            (int) $request->validated('revision'),
            $request->safe()->except('revision'),
        ));
    }

    public function destroy(KanbanTaskRequest $request, string $board, string $task, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->deleteTask(
            $request->user(),
            $board,
            $task,
            (int) $request->validated('revision'),
        ));
    }

    public function move(KanbanTaskRequest $request, string $board, string $task, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->moveTask(
            $request->user(),
            $board,
            $task,
            (int) $request->validated('revision'),
            $request->validated('column_id'),
            (float) $request->validated('position'),
        ));
    }
}
