<?php

namespace App\AI\Providers;

use App\AI\AiException;
use App\AI\AiProvider;
use App\AI\BrowserSearchResult;
use App\AI\GenerationRequest;
use App\AI\GenerationResult;
use App\AI\GroqUsage;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GroqProvider implements AiProvider
{
    public function generate(GenerationRequest $request): GenerationResult
    {
        $key = config('services.groq.key');

        if (!is_string($key) || $key === '') {
            throw new AiException('unavailable');
        }

        $started = hrtime(true);
        $usage = app(GroqUsage::class);
        $attemptId = $this->startUsage($usage, $request);

        try {
            $response = Http::withToken($key)->acceptJson()
                ->connectTimeout(config('ai.groq.connect_timeout'))
                ->timeout(config('ai.groq.timeout'))
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => $request->model,
                    'messages' => $request->messages,
                    'stream' => false,
                    'reasoning_effort' => config('ai.groq.reasoning_effort'),
                    'include_reasoning' => config('ai.groq.include_reasoning'),
                    'max_completion_tokens' => $request->maxOutputTokens,
                    ...($request->searchEnabled
                        ? ['tools' => [['type' => 'browser_search']], 'tool_choice' => 'auto']
                        : ['tool_choice' => 'none']),
                ]);
        } catch (ConnectionException) {
            $this->finishUsage($usage, $attemptId, null);

            throw new AiException('connection_failed');
        }

        $this->finishUsage($usage, $attemptId, $response);

        if ($response->status() === 429) {
            throw new AiException('rate_limited');
        }

        if (in_array($response->status(), [401, 403], true)) {
            throw new AiException('authentication_failed');
        }

        if (!$response->successful()) {
            throw new AiException('unavailable');
        }

        $text = $response->json('choices.0.message.content');

        if (!is_string($text) || trim($text) === '') {
            throw new AiException('invalid_response');
        }

        $model = $response->json('model');

        [$searchExecuted, $sources] = BrowserSearchResult::parse(
            $response->json('choices.0.message.executed_tools'),
        );

        return new GenerationResult(
            text: $text,
            model: is_string($model) && $model !== '' ? $model : null,
            inputTokens: $this->tokens($response->json('usage.prompt_tokens')),
            outputTokens: $this->tokens($response->json('usage.completion_tokens')),
            totalTokens: $this->tokens($response->json('usage.total_tokens')),
            durationMs: (int) ((hrtime(true) - $started) / 1_000_000),
            searchExecuted: $searchExecuted,
            sources: $sources,
        );
    }

    private function startUsage(GroqUsage $usage, GenerationRequest $request): ?string
    {
        try {
            return $usage->start($request);
        } catch (Throwable $error) {
            Log::warning('Failed to start Groq usage tracking', [
                'generation_id' => $request->generationId,
                'exception' => $error,
            ]);

            return null;
        }
    }

    private function finishUsage(GroqUsage $usage, ?string $attemptId, ?Response $response): void
    {
        if ($attemptId === null) {
            return;
        }

        try {
            $usage->finish($attemptId, $response);
        } catch (Throwable $error) {
            Log::warning('Failed to finish Groq usage tracking', [
                'attempt_id' => $attemptId,
                'exception' => $error,
            ]);
        }
    }

    private function tokens(mixed $value): ?int
    {
        return is_int($value) && $value >= 0 ? $value : null;
    }
}
