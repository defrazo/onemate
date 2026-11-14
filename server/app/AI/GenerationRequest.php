<?php

namespace App\AI;

final readonly class GenerationRequest
{
    /** @param array<int, array{role: string, content: string}> $messages */
    public function __construct(
        public array $messages,
        public string $model,
        public int $maxOutputTokens,
        public ?string $generationId = null,
        public bool $searchEnabled = false,
    ) {
    }
}
