<?php

return [
    'check_proxy' => [
        'host' => env('CHECK_PROXY_HOST'),
        'port' => (int) env('CHECK_PROXY_PORT', 1080),
        'username' => env('CHECK_PROXY_USERNAME'),
        'password' => env('CHECK_PROXY_PASSWORD'),
    ],

    'ipinfo' => [
        'token' => env('IPINFO_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],
];
