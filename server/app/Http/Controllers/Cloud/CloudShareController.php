<?php

namespace App\Http\Controllers\Cloud;

use App\Http\Controllers\Controller;
use App\Models\Cloud\CloudFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CloudShareController extends Controller
{
    public function store(Request $request, string $id): JsonResponse
    {
        $file = $request->user()
            ->cloudFiles()
            ->findOrFail($id);

        if (!$file->share_token) {
            $file->share_token = bin2hex(random_bytes(32));
            $file->save();
        }

        return response()->json([
            'url' => $this->publicUrl($file->share_token),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $file = $request->user()
            ->cloudFiles()
            ->findOrFail($id);

        $file->share_token = null;
        $file->save();

        return response()->json([
            'message' => 'Публичный доступ отключён',
        ]);
    }

    public function show(string $token): JsonResponse
    {
        $file = $this->findSharedFile($token);

        return response()->json([
            'name' => $file->name,
            'size' => $file->size,
            'mimeType' => $file->mime_type,
        ]);
    }

    public function preview(string $token): StreamedResponse
    {
        $file = $this->findSharedFile($token);

        $mimeType = $file->mime_type;

        $allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/avif',
            'application/pdf',
            'text/plain',
        ];

        abort_unless(in_array($mimeType, $allowedTypes, true), 415);

        $disk = Storage::disk(config('cloud.disk'));

        abort_unless($disk->exists($file->path), 404);

        $stream = $disk->readStream($file->path);

        abort_if($stream === false, 500);

        return response()->stream(function () use ($stream) {
            try {
                fpassthru($stream);
            } finally {
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
            'Cache-Control' => 'private, no-store',
        ]);
    }

    public function download(string $token): StreamedResponse
    {
        $file = $this->findSharedFile($token);

        $disk = Storage::disk(config('cloud.disk'));

        abort_unless($disk->exists($file->path), 404);

        return $disk->download($file->path, $file->name, [
            'Content-Type' => 'application/octet-stream',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    private function findSharedFile(string $token): CloudFile
    {
        abort_unless(preg_match('/^[a-f0-9]{64}$/', $token) === 1, 404);

        return CloudFile::query()
            ->where('share_token', $token)
            ->firstOrFail();
    }

    private function publicUrl(string $token): string
    {
        return rtrim(config('cloud.frontend_url'), '/') . "/share/{$token}";
    }
}
