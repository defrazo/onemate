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

    'toolbox' => [
        'url' => env('TOOLBOX_API_URL'),
        'internal_token' => env('TOOLBOX_INTERNAL_TOKEN'),
        'client_id' => env('TOOLBOX_OAUTH_CLIENT_ID'),
        'timeout' => (int) env('TOOLBOX_TIMEOUT', 5),
        'disconnect_timeout' => (int) env('TOOLBOX_DISCONNECT_TIMEOUT', 30),
    ],
];
