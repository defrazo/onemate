<?php

namespace App\AI;

final readonly class GenerationResult
{
    /** @param array<int, array{url: string, title: string, domain: string}> $sources */
    public function __construct(
        public string $text,
        public ?string $model,
        public ?int $inputTokens,
        public ?int $outputTokens,
        public ?int $totalTokens,
        public int $durationMs,
        public bool $searchExecuted = false,
        public array $sources = [],
    ) {
    }
}
