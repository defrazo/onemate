<?php

return [
    'provider' => 'groq',
    'model' => 'openai/gpt-oss-20b',
    'max_output_tokens' => 1500,

    'groq' => [
        'connect_timeout' => 5,
        'timeout' => 25,
        'reasoning_effort' => 'low',
        'include_reasoning' => false,
    ],
];
