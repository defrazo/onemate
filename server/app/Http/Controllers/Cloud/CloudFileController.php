<?php

namespace App\Http\Controllers\Cloud;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CloudFileController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $limitKb = (int) config('cloud.file_max_size_mb') * 1024;

        $request->validate([
            'file' => ['required', 'file', 'max:' . $limitKb],
        ]);

        $user = $request->user();
        $file = $request->file('file');
        $size = $file->getSize();
        $disk = config('cloud.disk');

        $cloudFile = DB::transaction(function () use ($user, $file, $size, $disk) {
            DB::table('users')
                ->where('id', $user->id)
                ->lockForUpdate()
                ->first();

            $usedBytes = $user->cloudFiles()->sum('size');
            $quotaBytes = (int) config('cloud.storage_limit_mb') * 1024 * 1024;

            if ($usedBytes + $size > $quotaBytes) {
                throw ValidationException::withMessages([
                    'file' => 'Недостаточно свободного места в облаке',
                ]);
            }

            $path = $file->store("cloud/{$user->id}", $disk);

            if ($path === false) {
                throw new \RuntimeException('Не удалось сохранить файл');
            }

            try {
                return $user->cloudFiles()->create([
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $size,
                ]);
            } catch (\Throwable $exception) {
                Storage::disk($disk)->delete($path);

                throw $exception;
            }
        });

        return response()->json([
            'id' => $cloudFile->id,
            'name' => $cloudFile->name,
            'size' => $cloudFile->size,
        ], 201);
    }

    public function download(Request $request, string $id): StreamedResponse
    {
        $file = $request->user()
            ->cloudFiles()
            ->findOrFail($id);

        $disk = Storage::disk(config('cloud.disk'));

        abort_unless($disk->exists($file->path), 404);

        return $disk->download($file->path, $file->name, [
            'Content-Type' => 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'isFavorite' => ['sometimes', 'required', 'boolean'],
        ]);

        if (empty($data)) {
            throw ValidationException::withMessages([
                'file' => 'Не указаны изменения',
            ]);
        }

        $file = $request->user()
            ->cloudFiles()
            ->findOrFail($id);

        if (array_key_exists('name', $data)) {
            $newName = trim($data['name']);

            if ($newName === '') {
                throw ValidationException::withMessages([
                    'name' => 'Введите имя файла',
                ]);
            }

            $oldExtension = pathinfo($file->name, PATHINFO_EXTENSION);
            $newExtension = pathinfo($newName, PATHINFO_EXTENSION);

            if (strcasecmp($oldExtension, $newExtension) !== 0) {
                throw ValidationException::withMessages([
                    'name' => 'Изменение расширения файла запрещено',
                ]);
            }

            $nameWithoutExtension = pathinfo($newName, PATHINFO_FILENAME);

            if (trim($nameWithoutExtension) === '') {
                throw ValidationException::withMessages([
                    'name' => 'Введите название файла',
                ]);
            }

            $file->name = $newName;
        }

        if (array_key_exists('isFavorite', $data)) {
            $file->is_favorite = $data['isFavorite'];
        }

        $file->save();

        return response()->json([
            'id' => $file->id,
            'name' => $file->name,
            'isFavorite' => $file->is_favorite,
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $file = $request->user()
            ->cloudFiles()
            ->findOrFail($id);

        $disk = Storage::disk(config('cloud.disk'));
        $path = $file->path;

        $file->delete();

        try {
            if ($disk->exists($path) && !$disk->delete($path)) {
                throw new \RuntimeException('Не удалось удалить файл из хранилища');
            }
        } catch (\Throwable $exception) {
            Log::error('Cloud file cleanup failed', [
                'file_id' => $id,
                'path' => $path,
                'error' => $exception->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Файл удалён',
        ]);
    }
}
