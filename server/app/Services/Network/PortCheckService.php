<?php

namespace App\Services\Network;

class PortCheckService
{
    private const TIMEOUT = 3;

    public function __construct(private readonly PublicHostResolver $hostResolver)
    {
    }

    public function check(string $host, int $port): array
    {
        $ip = $this->hostResolver->resolve($host);

        $startedAt = hrtime(true);

        $connection = @fsockopen(
            $ip,
            $port,
            $errorCode,
            $errorMessage,
            self::TIMEOUT,
        );

        if ($connection === false) {
            return [
                'host' => $host,
                'port' => $port,
                'status' => 'closed',
                'responseTime' => null,
                'ip' => $ip,
            ];
        }

        $responseTime = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        fclose($connection);

        return [
            'host' => $host,
            'port' => $port,
            'status' => 'open',
            'responseTime' => $responseTime,
            'ip' => $ip,
        ];
    }
}
