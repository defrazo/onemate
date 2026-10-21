<?php

namespace App\Http\Controllers\Cloud;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CloudController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $files = $user->cloudFiles()
            ->latest()
            ->get();

        $clipboard = DB::table('cloud_clipboards')
            ->where('user_id', $user->id)
            ->first(['text', 'revision']);

        return response()->json([
            'files' => $files->map(fn ($file) => [
                'id' => $file->id,
                'name' => $file->name,
                'size' => $file->size,
                'isFavorite' => $file->is_favorite,
                'mimeType' => $file->mime_type,
                'createdAt' => $file->created_at->toISOString(),
                'publicUrl' => $file->share_token
                    ? rtrim(config('cloud.frontend_url'), '/') . "/share/{$file->share_token}"
                    : null,
            ]),
            'usedBytes' => $files->sum('size'),
            'quotaBytes' => (int) config('cloud.storage_limit_mb') * 1024 * 1024,
            'text' => $clipboard?->text ?? '',
            'textRevision' => $clipboard?->revision ?? 0,
        ]);
    }

    public function saveText(Request $request): JsonResponse
    {
        $data = $request->validate([
            'text' => ['present', 'nullable', 'string', 'max:' . config('cloud.text_max_length')],
            'revision' => ['required', 'integer', 'min:0'],
        ]);

        $userId = $request->user()->id;

        return DB::transaction(function () use ($userId, $data) {
            DB::table('users')
                ->where('id', $userId)
                ->lockForUpdate()
                ->first(['id']);

            $clipboard = DB::table('cloud_clipboards')
                ->where('user_id', $userId)
                ->first(['text', 'revision']);

            if (!$clipboard) {
                DB::table('cloud_clipboards')->insert([
                    'user_id' => $userId,
                    'text' => '',
                    'revision' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $clipboard = (object) [
                    'text' => '',
                    'revision' => 0,
                ];
            }

            if ((int) $clipboard->revision !== (int) $data['revision']) {
                return response()->json([
                    'message' => 'Текст изменён на другом устройстве',
                ], 409);
            }

            $text = $data['text'] ?? '';
            $revision = (int) $clipboard->revision;

            if ($clipboard->text !== $text) {
                $revision++;

                DB::table('cloud_clipboards')
                    ->where('user_id', $userId)
                    ->update([
                        'text' => $text,
                        'revision' => $revision,
                        'updated_at' => now(),
                    ]);
            }

            return response()->json([
                'text' => $text,
                'revision' => $revision,
            ]);
        });
    }

    public function getText(Request $request): JsonResponse
    {
        $clipboard = DB::table('cloud_clipboards')
            ->where('user_id', $request->user()->id)
            ->first(['text', 'revision']);

        return response()->json([
            'text' => $clipboard?->text ?? '',
            'revision' => $clipboard?->revision ?? 0,
        ]);
    }
}
