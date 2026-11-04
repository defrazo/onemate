<?php

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kanban\StoreKanbanBoardRequest;
use App\Services\Kanban\KanbanBoardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KanbanBoardController extends Controller
{
    public function index(Request $request, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->list($request->user()));
    }

    public function initialize(Request $request, KanbanBoardService $service): JsonResponse
    {
        $result = $service->initialize($request->user());

        return response()->json($result['data'], $result['created'] ? 201 : 200);
    }

    public function show(Request $request, string $board, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->show($request->user(), $board));
    }

    public function store(StoreKanbanBoardRequest $request, KanbanBoardService $service): JsonResponse
    {
        $result = $service->create($request->user(), $request->validated('title'));

        return response()->json($result['data'], 201);
    }

    public function update(StoreKanbanBoardRequest $request, string $board, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->rename(
            $request->user(),
            $board,
            (int) $request->validated('revision'),
            $request->validated('title'),
        ));
    }

    public function destroy(StoreKanbanBoardRequest $request, string $board, KanbanBoardService $service): JsonResponse
    {
        return response()->json($service->delete(
            $request->user(),
            $board,
            (int) $request->validated('revision'),
        ));
    }
}
