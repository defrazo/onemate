<?php

return [
    'storage_limit_mb' => (int) env('CLOUD_STORAGE_LIMIT_MB', 500),
    'text_max_length' => (int) env('CLOUD_TEXT_MAX_LENGTH', 10000),
    'file_max_size_mb' => (int) env('CLOUD_FILE_MAX_SIZE_MB', 250),
    'disk' => env('CLOUD_DISK', 'local'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
