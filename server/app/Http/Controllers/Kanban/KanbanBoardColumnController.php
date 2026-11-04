<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\KanbanColumnRequest;
use App\Services\Kanban\KanbanBoardService;
use Illuminate\Http\JsonResponse;

class KanbanBoardColumnController extends Controller
{
    public function store(KanbanColumnRequest $request, string $board, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->createColumn(
            $request->user(),
            $board,
            (int) $request->validated('revision'),
            $request->safe()->except('revision'),
        ), 201);
    }

    public function update(KanbanColumnRequest $request, string $board, string $column, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->updateColumn(
            $request->user(),
            $board,
            $column,
            (int) $request->validated('revision'),
            $request->safe()->except('revision'),
        ));
    }

    public function destroy(KanbanColumnRequest $request, string $board, string $column, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->deleteColumn(
            $request->user(),
            $board,
            $column,
            (int) $request->validated('revision'),
        ));
    }

    public function reorder(KanbanColumnRequest $request, string $board, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->reorderColumns(
            $request->user(),
            $board,
            (int) $request->validated('revision'),
            $request->validated('column_ids'),
        ));
    }
}
