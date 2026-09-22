<?php

namespace App\Services\Network\Support;

use InvalidArgumentException;

class HostNormalizer
{
    public function normalize(string $value): string
    {
        $value = trim($value);

        if ($value === '') {
            throw new InvalidArgumentException('Укажите адрес ресурса');
        }

        if (filter_var($value, FILTER_VALIDATE_IP)) {
            return $value;
        }

        $url = str_contains($value, '://')
            ? $value
            : "https://{$value}";

        $host = parse_url($url, PHP_URL_HOST);

        if (!is_string($host) || $host === '') {
            throw new InvalidArgumentException('Не удалось определить адрес ресурса');
        }

        return $host;
    }
}
