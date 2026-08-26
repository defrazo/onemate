<?php

namespace App\Http\Controllers;

use App\Models\KanbanColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KanbanColumnController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $columns = $request->user()
            ->kanbanColumns()
            ->orderBy('position')
            ->get();

        return response()->json([
            'columns' => $columns,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'task_limit' => ['nullable', 'integer', 'min:1'],
            'position' => ['required', 'numeric'],
            'color' => ['nullable', 'string', 'max:50'],
        ]);

        $column = $request->user()
            ->kanbanColumns()
            ->create([
                ...$data,
                'unique_key' => (string) Str::uuid(),
            ]);

        return response()->json([
            'column' => $column,
        ], 201);
    }

    public function update(Request $request, KanbanColumn $column): JsonResponse
    {
        $column = $this->resolveColumn($request, $column);

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'task_limit' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'position' => ['sometimes', 'numeric'],
            'color' => ['sometimes', 'nullable', 'string', 'max:50'],
        ]);

        $column->update($data);

        return response()->json([
            'column' => $column->fresh(),
        ]);
    }

    public function move(Request $request, KanbanColumn $column): JsonResponse
    {
        $column = $this->resolveColumn($request, $column);

        $data = $request->validate([
            'position' => ['required', 'numeric'],
        ]);

        $column->update([
            'position' => $data['position'],
        ]);

        return response()->json([
            'column' => $column->fresh(),
        ]);
    }

    public function destroy(Request $request, KanbanColumn $column): JsonResponse
    {
        $column = $this->resolveColumn($request, $column);

        $column->delete();

        return response()->json([
            'code' => 'COLUMN_DELETED',
        ]);
    }

    private function resolveColumn(Request $request, KanbanColumn $column): KanbanColumn
    {
        return $request->user()
            ->kanbanColumns()
            ->whereKey($column->getKey())
            ->firstOrFail();
    }
}
