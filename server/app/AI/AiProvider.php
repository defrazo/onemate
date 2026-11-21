<?php

namespace App\AI;

interface AiProvider
{
    public function generate(GenerationRequest $request): GenerationResult;
}
