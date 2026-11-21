<?php

namespace App\Jobs;

use App\AI\AiException;
use App\AI\AiProvider;
use App\Services\Assistant\AssistantContextBuilder;
use App\Services\Assistant\AssistantService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use RuntimeException;
use Throwable;

class GenerateAssistantResponse implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 35;

    public bool $failOnTimeout = true;

    public function __construct(
        public readonly string $generationId,
    ) {
    }

    public function handle(
        AiProvider $provider,
        AssistantService $service,
        AssistantContextBuilder $context,
    ): void {
        try {
            $attempt = $service->claim($this->generationId);
        } catch (Throwable $error) {
            throw new RuntimeException(
                'Assistant generation could not be claimed',
                previous: $error,
            );
        }

        if (!$attempt) {
            return;
        }

        try {
            if ($attempt->provider !== config('ai.provider')) {
                throw new AiException('unavailable');
            }

            $result = $provider->generate($context->build($attempt));

            $service->complete($attempt, $result);
        } catch (Throwable $error) {
            $code = $error instanceof AiException
                ? match ($error->reason) {
                    'connection_failed' => 'PROVIDER_CONNECTION_FAILED',
                    'rate_limited' => 'PROVIDER_RATE_LIMITED',
                    'authentication_failed' => 'PROVIDER_AUTHENTICATION_FAILED',
                    'invalid_response' => 'INVALID_RESPONSE',
                    default => 'PROVIDER_UNAVAILABLE',
                }
            : 'INTERNAL_ERROR';

            try {
                $service->fail($attempt, $code);
            } catch (Throwable $failure) {
                throw new RuntimeException(
                    'Assistant generation could not be finalized',
                    previous: $failure,
                );
            }
        } finally {
            try {
                $service->finishCancelled($attempt);
            } catch (Throwable $error) {
                throw new RuntimeException(
                    'Cancelled Assistant execution could not be finalized',
                    previous: $error,
                );
            }
        }
    }

    public function failed(?Throwable $exception): void
    {
        try {
            app(AssistantService::class)->interrupted($this->generationId);
        } catch (Throwable $error) {
            throw new RuntimeException(
                'Assistant execution state could not be finalized',
                previous: $error,
            );
        }
    }
}
