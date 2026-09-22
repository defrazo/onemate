<?php

namespace App\Services\Network;

use App\Services\Network\Support\HostNormalizer;
use App\Services\Network\Support\PublicHostResolver;

class PortCheckService
{
    private const TIMEOUT = 3;

    public function __construct(private readonly HostNormalizer $hostNormalizer, private readonly PublicHostResolver $hostResolver)
    {
    }

    public function check(string $host, int $port): array
    {
        $host = $this->hostNormalizer->normalize($host);
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
