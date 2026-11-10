<?php

namespace App\Http\Controllers\Cloud;

use App\Http\Controllers\Controller;
use App\Models\Cloud\CloudFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CloudShareController extends Controller
{
    public function store(Request $request, string $id): JsonResponse
    {
        $file = DB::transaction(function () use ($request, $id) {
            $file = $request->user()
                ->cloudFiles()
                ->whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if (!$file->share_token) {
                $file->share_token = bin2hex(random_bytes(32));
            }

            if (!$file->share_code) {
                $file->share_code = $this->generateShareCode();
            }

            if ($file->isDirty()) {
                $file->save();
            }

            return $file;
        });

        return response()->json([
            'url' => $this->shortUrl($file->share_code),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $file = $request->user()
            ->cloudFiles()
            ->findOrFail($id);

        $file->share_token = null;
        $file->share_code = null;
        $file->save();

        return response()->json([
            'message' => 'Публичный доступ отключён',
        ]);
    }

    public function redirect(string $code): RedirectResponse
    {
        abort_unless(preg_match('/^f[a-f0-9]{15}$/', $code) === 1, 404);

        $file = CloudFile::query()
            ->where('share_code', $code)
            ->whereNotNull('share_token')
            ->firstOrFail();

        return redirect()->away(
            $this->publicUrl($file->share_token),
            302,
            ['Cache-Control' => 'no-store'],
        );
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

    private function generateShareCode(): string
    {
        do {
            $code = 'f' . substr(bin2hex(random_bytes(8)), 0, 15);
        } while (CloudFile::query()->where('share_code', $code)->exists());

        return $code;
    }

    private function publicUrl(string $token): string
    {
        return rtrim(config('cloud.frontend_url'), '/') . "/share/{$token}";
    }

    private function shortUrl(string $code): string
    {
        return rtrim(config('cloud.short_url'), '/') . "/{$code}";
    }
}
