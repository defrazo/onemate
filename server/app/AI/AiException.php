<?php

namespace App\AI;

use RuntimeException;

class AiException extends RuntimeException
{
    public function __construct(public readonly string $reason)
    {
        parent::__construct('AI provider request failed');
    }
}
