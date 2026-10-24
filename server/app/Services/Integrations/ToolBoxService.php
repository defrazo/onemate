<?php

namespace App\Services\Integrations;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ToolBoxService
{
    public function getConnectedAccount(string $userId): array
    {
        try {
            $response = Http::baseUrl(config('services.toolbox.url'))
                ->withToken(config('services.toolbox.internal_token'))
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(config('services.toolbox.timeout', 5))
                ->get("/api/internal/onemate/accounts/{$userId}");
        } catch (ConnectionException $e) {
            report($e);

            throw new RuntimeException('ToolBox временно недоступен', previous: $e);
        }

        if (!$response->successful()) {
            throw new RuntimeException('Не удалось получить данные ToolBox');
        }

        return $response->json();
    }

    public function disconnectAccount(
        string $userId,
        string $expectedAccountType,
    ): array {
        try {
            $response = Http::baseUrl(config('services.toolbox.url'))
                ->withToken(config('services.toolbox.internal_token'))
                ->acceptJson()
                ->connectTimeout(5)
                ->timeout(config('services.toolbox.disconnect_timeout', 30))
                ->delete("/api/internal/onemate/accounts/{$userId}", [
                    'expected_account_type' => $expectedAccountType,
                ]);
        } catch (ConnectionException $e) {
            report($e);

            throw new RuntimeException('ToolBox временно недоступен', previous: $e);
        }

        if ($response->status() === 409) {
            throw new HttpResponseException(
                response()->json([
                    'message' => 'Тип аккаунта изменился. Обновите страницу и попробуйте снова',
                ], 409),
            );
        }

        if (!$response->successful()) {
            throw new RuntimeException('Не удалось отключить ToolBox');
        }

        return $response->json();
    }
}
