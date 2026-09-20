<?php

namespace App\Services\Network;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;

class AddressCheckService
{
    private const MAX_REDIRECTS = 5;

    public function __construct(private readonly PublicHostResolver $hostResolver)
    {
    }

    public function check(string $url): array
    {
        $currentUrl = $url;

        try {
            for ($redirects = 0; $redirects <= self::MAX_REDIRECTS; $redirects++) {
                [$host, $ip] = $this->resolvePublicHost($currentUrl);

                $response = $this->request($currentUrl, $host, $ip);

                if (!$response->redirect()) {
                    return $this->result(
                        url: $url,
                        status: 'up',
                        statusCode: $response->status(),
                        responseTime: $this->responseTime($response),
                        ip: $ip,
                    );
                }

                if ($redirects === self::MAX_REDIRECTS) {
                    return $this->down($url, $ip);
                }

                $location = $response->header('Location');

                if (!$location) {
                    return $this->result(
                        url: $url,
                        status: 'up',
                        statusCode: $response->status(),
                        responseTime: $this->responseTime($response),
                        ip: $ip,
                    );
                }

                $currentUrl = $this->resolveRedirectUrl($currentUrl, $location);
            }
        } catch (ConnectionException) {
            return $this->down($url);
        }

        return $this->down($url);
    }

    private function request(string $url, string $host, string $ip): Response
    {
        $port = parse_url($url, PHP_URL_PORT)
            ?: (parse_url($url, PHP_URL_SCHEME) === 'https' ? 443 : 80);

        return Http::connectTimeout(3)
            ->timeout(5)
            ->withOptions([
                'allow_redirects' => false,
                'curl' => [
                    CURLOPT_RESOLVE => [
                        "{$host}:{$port}:{$ip}",
                    ],
                ],
            ])
            ->get($url);
    }

    private function resolvePublicHost(string $url): array
    {
        $host = parse_url($url, PHP_URL_HOST);

        if (!is_string($host) || $host === '') {
            throw new InvalidArgumentException('Некорректный адрес.');
        }

        return [
            $host,
            $this->hostResolver->resolve($host),
        ];
    }

    private function responseTime(Response $response): int
    {
        return (int) round(
            $response->handlerStats()['total_time'] * 1000,
        );
    }

    private function result(
        string $url,
        string $status,
        ?int $statusCode,
        ?int $responseTime,
        ?string $ip,
    ): array {
        return [
            'url' => $url,
            'status' => $status,
            'statusCode' => $statusCode,
            'responseTime' => $responseTime,
            'ip' => $ip,
        ];
    }

    private function down(string $url, ?string $ip = null): array
    {
        return $this->result(
            url: $url,
            status: 'down',
            statusCode: null,
            responseTime: null,
            ip: $ip,
        );
    }

    private function resolveRedirectUrl(string $url, string $location): string
    {
        if (filter_var($location, FILTER_VALIDATE_URL)) {
            return $location;
        }

        $parts = parse_url($url);

        $scheme = $parts['scheme'];
        $host = $parts['host'];
        $port = isset($parts['port']) ? ":{$parts['port']}" : '';

        if (str_starts_with($location, '/')) {
            return "{$scheme}://{$host}{$port}{$location}";
        }

        $path = $parts['path'] ?? '/';
        $directory = rtrim(dirname($path), '/');

        return "{$scheme}://{$host}{$port}{$directory}/{$location}";
    }
}
