<?php

namespace App\AI;

use Carbon\CarbonImmutable;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GroqUsage
{
    private const PROVIDER = 'groq';

    private const MAX_TOOLS = 100;

    private const RATE_LIMIT_HEADERS = [
        'x-ratelimit-limit-requests',
        'x-ratelimit-remaining-requests',
        'x-ratelimit-reset-requests',
        'x-ratelimit-limit-tokens',
        'x-ratelimit-remaining-tokens',
        'x-ratelimit-reset-tokens',
        'retry-after',
    ];

    public function start(GenerationRequest $request): string
    {
        $id = (string) Str::uuid();

        DB::table('ai_provider_requests')->insert([
            'id' => $id,
            'generation_id' => $request->generationId,
            'provider' => self::PROVIDER,
            'model' => $request->model,
            'started_at' => now('UTC'),
            'state' => 'unknown',
        ]);

        return $id;
    }

    public function finish(string $id, ?Response $response): void
    {
        $observed = now('UTC');
        $headers = $this->rateLimitHeaders($response);
        $content = $response?->json('choices.0.message.content');

        $completed = $response !== null
            && $response->successful()
            && is_string($content)
            && trim($content) !== '';

        DB::table('ai_provider_requests')
            ->where('id', $id)
            ->update([
                'finished_at' => $observed,
                'observed_at' => $response ? $observed : null,
                'http_status' => $response?->status(),
                'state' => !$response ? 'unknown' : ($completed ? 'completed' : 'error'),
                'input_tokens' => $this->number($response?->json('usage.prompt_tokens')),
                'output_tokens' => $this->number($response?->json('usage.completion_tokens')),
                'total_tokens' => $this->number($response?->json('usage.total_tokens')),
                'rate_limits' => $headers
                    ? json_encode($headers, JSON_THROW_ON_ERROR)
                    : null,
                'response_diagnostics' => $response
                    ? json_encode($this->responseDiagnostics($response), JSON_THROW_ON_ERROR)
                    : null,
            ]);
    }

    public function snapshot(): array
    {
        $now = CarbonImmutable::now('UTC');
        $model = config('ai.model');

        $query = DB::table('ai_provider_requests')
            ->where('provider', self::PROVIDER)
            ->where('model', $model);

        $last = (clone $query)
            ->whereNotNull('rate_limits')
            ->orderByDesc('observed_at')
            ->orderByDesc('id')
            ->first();

        $headers = $last
            ? json_decode($last->rate_limits, true)
            : [];

        $observed = $last
            ? CarbonImmutable::parse($last->observed_at, 'UTC')
            : null;

        $dayStart = $now->startOfDay();

        $day = (clone $query)
            ->where('started_at', '>=', $dayStart)
            ->where('started_at', '<=', $now)
            ->selectRaw(
                'COUNT(*) as attempts, COUNT(total_tokens) as known, SUM(total_tokens) as tokens',
            )
            ->first();

        $attempts = (int) $day->attempts;
        $known = (int) $day->known;

        $minuteRequests = (clone $query)
            ->where('started_at', '>', $now->subMinute())
            ->where('started_at', '<=', $now)
            ->count();

        return [
            'model' => $model,
            'observed_at' => $observed?->toISOString(),
            'daily_requests' => $this->rateLimitWindow(
                'requests',
                1000,
                $headers,
                $observed,
                $now,
            ),
            'daily_requests_local' => [
                'source' => 'onemate',
                'limit' => 1000,
                'used' => $attempts,
                'period_start' => $dayStart->toISOString(),
            ],
            'minute_tokens' => $this->rateLimitWindow(
                'tokens',
                8000,
                $headers,
                $observed,
                $now,
            ),
            'daily_tokens' => [
                'source' => 'onemate',
                'limit' => 200000,
                'remaining' => null,
                'used' => $known > 0 ? (int) $day->tokens : null,
                'unmeasured_attempts' => $attempts - $known,
                'period_start' => $dayStart->toISOString(),
            ],
            'minute_requests' => [
                'source' => 'onemate',
                'limit' => 30,
                'remaining' => null,
                'used' => $minuteRequests,
            ],
        ];
    }

    private function rateLimitHeaders(?Response $response): array
    {
        $headers = [];

        foreach (self::RATE_LIMIT_HEADERS as $name) {
            $value = $response?->header($name);

            if (is_string($value) && $value !== '') {
                $headers[$name] = substr($value, 0, 100);
            }
        }

        return $headers;
    }

    private function responseDiagnostics(Response $response): array
    {
        $body = json_decode($response->body());
        $valid = json_last_error() === JSON_ERROR_NONE;

        $choices = is_object($body)
            ? ($body->choices ?? null)
            : null;

        $choice = is_array($choices)
            ? ($choices[0] ?? null)
            : null;

        $messagePresent = is_object($choice)
            && property_exists($choice, 'message');

        $message = $messagePresent && is_object($choice->message)
            ? $choice->message
            : null;

        $contentPresent = $message !== null
            && property_exists($message, 'content');

        $content = $contentPresent
            ? $message->content
            : null;

        $finish = is_object($choice)
            ? ($choice->finish_reason ?? null)
            : null;

        $toolsPresent = $message !== null
            && property_exists($message, 'executed_tools');

        $tools = $toolsPresent
            ? $message->executed_tools
            : null;

        $toolCounts = $this->countBrowserTools($tools);

        return [
            'json_valid' => $valid,
            'choices_count' => is_array($choices) ? count($choices) : null,
            'message_present' => $messagePresent,
            'content_state' => $this->contentState($content, $contentPresent),
            'content_length' => is_string($content) ? mb_strlen($content) : null,
            'finish_reason' => in_array(
                $finish,
                ['stop', 'length', 'tool_calls', 'function_call'],
                true,
            )
                ? $finish
                : (is_object($choice) && property_exists($choice, 'finish_reason')
                    ? 'other'
                    : 'missing'),
            'tool_calls_count' => is_array($message?->tool_calls ?? null)
                ? count($message->tool_calls)
                : null,
            'function_call_present' => $message !== null
                && isset($message->function_call),
            'refusal_present' => $message !== null
                && isset($message->refusal),
            'reasoning_present' => $message !== null
                && isset($message->reasoning),
            'executed_tools_state' => match (true) {
                !$toolsPresent => 'missing',
                $tools === null => 'null',
                is_array($tools) => 'list',
                default => 'wrong_type',
            },
            'browser_search_count' => $toolCounts['searches'],
            'browser_open_count' => $toolCounts['opens'],
            'executed_tools_malformed' => $toolCounts['malformed'],
            'executed_tools_truncated' => is_array($tools)
                && count($tools) > self::MAX_TOOLS,
        ];
    }

    private function countBrowserTools(mixed $tools): array
    {
        if (!is_array($tools)) {
            return [
                'searches' => null,
                'opens' => null,
                'malformed' => false,
            ];
        }

        $searches = 0;
        $opens = 0;
        $malformed = false;

        foreach (array_slice($tools, 0, self::MAX_TOOLS) as $tool) {
            if (
                !is_object($tool)
                || !is_string($tool->name ?? null)
                || !is_string($tool->type ?? null)
            ) {
                $malformed = true;

                continue;
            }

            if ($tool->name === 'browser.search' && $tool->type === 'browser_search') {
                $searches++;
            } elseif (
                $tool->name === 'browser.open'
                && in_array($tool->type, ['browser_search', 'browser.open'], true)
            ) {
                $opens++;
            }
        }

        return [
            'searches' => $searches,
            'opens' => $opens,
            'malformed' => $malformed,
        ];
    }

    private function contentState(mixed $content, bool $present): string
    {
        return match (true) {
            !$present => 'missing',
            $content === null => 'null',
            !is_string($content) => 'wrong_type',
            $content === '' => 'empty',
            trim($content) === '' => 'whitespace',
            default => 'text',
        };
    }

    private function rateLimitWindow(
        string $kind,
        int $fallback,
        array $headers,
        ?CarbonImmutable $observed,
        CarbonImmutable $now,
    ): array {
        $limit = $this->number($headers["x-ratelimit-limit-$kind"] ?? null);
        $seconds = $this->duration($headers["x-ratelimit-reset-$kind"] ?? null);

        $reset = $observed !== null && $seconds !== null
            ? $observed->addMicroseconds((int) ($seconds * 1000000))
            : null;

        $stale = $reset === null || $reset->lte($now);

        return [
            'source' => self::PROVIDER,
            'limit_source' => $limit !== null ? self::PROVIDER : 'published',
            'limit' => $limit ?? $fallback,
            'remaining' => $stale
                ? null
                : $this->number($headers["x-ratelimit-remaining-$kind"] ?? null),
            'reset_at' => $reset?->toISOString(),
            'stale' => $stale,
        ];
    }

    private function number(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value >= 0 ? $value : null;
        }

        if (!is_string($value) || !ctype_digit($value)) {
            return null;
        }

        $number = filter_var($value, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 0],
        ]);

        return $number === false ? null : $number;
    }

    private function duration(?string $value): ?float
    {
        if (
            !$value
            || !preg_match('/^(?:\d+(?:\.\d+)?(?:ms|s|m|h|d))+$/', $value)
        ) {
            return null;
        }

        preg_match_all(
            '/(\d+(?:\.\d+)?)(ms|s|m|h|d)/',
            $value,
            $parts,
            PREG_SET_ORDER,
        );

        $seconds = 0.0;

        $units = [
            'ms' => 0.001,
            's' => 1,
            'm' => 60,
            'h' => 3600,
            'd' => 86400,
        ];

        foreach ($parts as $part) {
            $seconds += (float) $part[1] * $units[$part[2]];

            if (!is_finite($seconds) || $seconds > PHP_INT_MAX / 1000000) {
                return null;
            }
        }

        return $seconds;
    }
}
