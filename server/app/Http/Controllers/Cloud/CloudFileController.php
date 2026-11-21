<?php

namespace App\Http\Controllers\Cloud;

use App\Http\Controllers\Controller;
use App\Models\Cloud\CloudFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipStream\CompressionMethod;
use ZipStream\ZipStream;

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

        $this->createThumbnail($cloudFile, $file);

        return response()->json([
            'id' => $cloudFile->id,
            'name' => $cloudFile->name,
            'size' => $cloudFile->size,
        ], 201);
    }

    public function thumbnail(Request $request, string $id): Response
    {
        $file = $request->user()->cloudFiles()->findOrFail($id);
        $contents = null;

        try {
            $contents = Storage::disk(config('cloud.disk'))->get($this->thumbnailPath($file));
        } catch (\Throwable) {
        }

        if (!is_string($contents) || $contents === '') {
            return response('', 204);
        }

        return response($contents, 200, [
            'Content-Type' => 'image/webp',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    public function download(Request $request, string $id): StreamedResponse
    {
        $file = $request->user()
            ->cloudFiles()
            ->findOrFail($id);

        $disk = Storage::disk(config('cloud.disk'));

        abort_unless($disk->exists($file->path), 404);

        return $disk->download($file->path, $file->name, [
            'Content-Type' => $file->mime_type ?: 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function downloadArchive(Request $request): StreamedResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:2', 'max:100'],
            'ids.*' => ['required', 'uuid', 'distinct'],
        ]);

        $ids = $data['ids'];

        $files = $request->user()
            ->cloudFiles()
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        if ($files->count() !== count($ids)) {
            throw ValidationException::withMessages([
                'ids' => 'Некоторые файлы не найдены или недоступны',
            ]);
        }

        $disk = Storage::disk(config('cloud.disk'));

        foreach ($files as $file) {
            abort_unless($disk->exists($file->path), 404);
        }

        $reserved = [];

        foreach ($files as $file) {
            $name = $this->normalizeArchiveFilename($file->name);
            $reserved[$name] = true;
        }

        $used = [];
        $entries = [];

        foreach ($ids as $id) {
            $file = $files->get($id);
            $name = $this->normalizeArchiveFilename($file->name);

            if (isset($used[$name])) {
                $extension = pathinfo($name, PATHINFO_EXTENSION);
                $basename = pathinfo($name, PATHINFO_FILENAME);
                $number = 2;

                do {
                    $candidate = $basename . " ({$number})";

                    if ($extension !== '') {
                        $candidate .= '.' . $extension;
                    }

                    $number++;
                } while (isset($reserved[$candidate]) || isset($used[$candidate]));

                $name = $candidate;
            }

            $used[$name] = true;

            $entries[] = [
                'name' => $name,
                'path' => $file->path,
            ];
        }

        $filename = 'Cloud_' . now()->format('Y-m-d H-i-s') . '.zip';

        return response()->streamDownload(function () use ($disk, $entries) {
            $zip = new ZipStream(
                sendHttpHeaders: false,
                defaultCompressionMethod: CompressionMethod::STORE,
                defaultEnableZeroHeader: true,
            );

            foreach ($entries as $entry) {
                $stream = $disk->readStream($entry['path']);

                if ($stream === false) {
                    throw new \RuntimeException('Не удалось прочитать файл');
                }

                try {
                    $zip->addFileFromStream(
                        fileName: $entry['name'],
                        stream: $stream,
                    );
                } finally {
                    fclose($stream);
                }
            }

            $zip->finish();
        }, $filename, [
            'Content-Type' => 'application/zip',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
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
        $this->deleteThumbnail($file);

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

    public function destroyMany(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => ['required', 'uuid', 'distinct'],
        ]);

        $ids = $data['ids'];

        $files = $request->user()
            ->cloudFiles()
            ->whereIn('id', $ids)
            ->get();

        if ($files->count() !== count($ids)) {
            throw ValidationException::withMessages([
                'ids' => 'Некоторые файлы не найдены или недоступны',
            ]);
        }

        $disk = Storage::disk(config('cloud.disk'));

        DB::transaction(function () use ($files) {
            foreach ($files as $file) {
                $file->delete();
            }
        });

        foreach ($files as $file) {
            $this->deleteThumbnail($file);

            try {
                if ($disk->exists($file->path) && !$disk->delete($file->path)) {
                    throw new \RuntimeException('Не удалось удалить файл из хранилища');
                }
            } catch (\Throwable $exception) {
                Log::error('Cloud file cleanup failed', [
                    'file_id' => $file->id,
                    'path' => $file->path,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Файлы удалены',
        ]);
    }

    private function thumbnailPath(CloudFile $file): string
    {
        return "cloud/{$file->user_id}/thumbnails/{$file->id}.webp";
    }

    private function deleteThumbnail(CloudFile $file): void
    {
        try {
            Storage::disk(config('cloud.disk'))->delete($this->thumbnailPath($file));
        } catch (\Throwable) {
        }
    }

    private function createThumbnail(CloudFile $file, UploadedFile $upload): void
    {
        $image = null;
        $thumbnail = null;
        $stream = null;

        try {
            if (!function_exists('imagewebp') || $file->size > 10 * 1024 * 1024) {
                return;
            }

            $path = $upload->getRealPath();
            $info = @getimagesize($path);
            $decoders = [
                'image/jpeg' => 'imagecreatefromjpeg',
                'image/png' => 'imagecreatefrompng',
                'image/webp' => 'imagecreatefromwebp',
            ];
            $decoder = $decoders[$file->mime_type] ?? null;

            if (!$info || !$decoder || !function_exists($decoder)
                || ($info['mime'] ?? null) !== $file->mime_type
                || $info[0] < 1 || $info[1] < 1 || $info[0] * $info[1] > 8_000_000) {
                return;
            }

            $image = @$decoder($path);

            if (!$image) {
                return;
            }

            if ($file->mime_type === 'image/jpeg' && function_exists('exif_read_data')) {
                $exif = @exif_read_data($path);
                $orientation = (int) ($exif['Orientation'] ?? 1);
                $angle = match ($orientation) {
                    3, 4 => 180,
                    5, 6 => -90,
                    7, 8 => 90,
                    default => 0,
                };

                if ($angle !== 0) {
                    $rotated = imagerotate($image, $angle, 0);

                    if (!$rotated) {
                        return;
                    }
                    imagedestroy($image);
                    $image = $rotated;
                }

                if (in_array($orientation, [2, 4, 5, 7], true)) {
                    imageflip($image, IMG_FLIP_HORIZONTAL);
                }
            }

            $width = imagesx($image);
            $height = imagesy($image);
            $side = min($width, $height);
            $thumbnail = imagecreatetruecolor(96, 96);

            imagealphablending($thumbnail, false);
            imagesavealpha($thumbnail, true);

            if (!imagecopyresampled($thumbnail, $image, 0, 0,
                (int) floor(($width - $side) / 2), (int) floor(($height - $side) / 2),
                96, 96, $side, $side)) {
                return;
            }

            $stream = fopen('php://temp', 'w+b');

            if ($stream === false || !imagewebp($thumbnail, $stream, 80)) {
                return;
            }
            rewind($stream);
            Storage::disk(config('cloud.disk'))->put($this->thumbnailPath($file), $stream, ['visibility' => 'private']);
        } catch (\Throwable) {
        } finally {
            if ($image instanceof \GdImage) {
                imagedestroy($image);
            }

            if ($thumbnail instanceof \GdImage) {
                imagedestroy($thumbnail);
            }

            if (is_resource($stream)) {
                fclose($stream);
            }
        }
    }

    private function normalizeArchiveFilename(string $name): string
    {
        $name = trim(str_replace(['/', '\\'], '_', $name));

        if ($name === '' || $name === '.' || $name === '..') {
            return 'file';
        }

        return $name;
    }
}
