<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\UserNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserNoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notes = $request->user()
            ->notes()
            ->orderBy('order_idx')
            ->get();

        return response()->json([
            'notes' => $notes,
        ]);
    }

    public function replace(Request $request): JsonResponse
    {
        $data = $request->validate([
            'notes' => ['required', 'array', 'min:1', 'max:50'],
            'notes.*.id' => ['required', 'uuid'],
            'notes.*.text' => ['required', 'string', 'max:5000'],
            'notes.*.order_idx' => ['required', 'integer', 'min:0'],
        ]);

        $user = $request->user();
        $now = now();

        DB::transaction(function () use ($user, $data, $now): void {
            $user->notes()->delete();

            $rows = collect($data['notes'])
                ->map(fn (array $note) => [
                    'id' => $note['id'],
                    'user_id' => $user->id,
                    'text' => $note['text'],
                    'order_idx' => $note['order_idx'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
                ->all();

            UserNote::query()->insert($rows);
        });

        return response()->json([
            'code' => 'NOTES_UPDATED',
        ]);
    }
}
