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

    public function check(string $host, int $port, string $checkVia = 'direct'): array
    {
        $host = $this->hostNormalizer->normalize($host);
        $ip = $this->hostResolver->resolve($host);

        $startedAt = hrtime(true);

        $connected = $checkVia === 'proxy'
            ? $this->connectViaProxy($ip, $port)
            : $this->connectDirect($ip, $port);

        return [
            'host' => $host,
            'port' => $port,
            'checkVia' => $checkVia,
            'status' => $connected ? 'open' : 'closed',
            'responseTime' => $connected
                ? (int) round((hrtime(true) - $startedAt) / 1_000_000)
                : null,
            'ip' => $ip,
        ];
    }

    private function connectDirect(string $ip, int $port): bool
    {
        $connection = @fsockopen(
            $ip,
            $port,
            $errorCode,
            $errorMessage,
            self::TIMEOUT,
        );

        if ($connection === false) {
            return false;
        }

        fclose($connection);

        return true;
    }

    private function connectViaProxy(string $ip, int $port): bool
    {
        $proxy = config('services.check_proxy');

        $curl = curl_init();

        try {
            curl_setopt_array($curl, [
                CURLOPT_URL => "http://{$ip}:{$port}/",
                CURLOPT_PROXY => $proxy['host'],
                CURLOPT_PROXYPORT => $proxy['port'],
                CURLOPT_PROXYTYPE => CURLPROXY_SOCKS5,
                CURLOPT_PROXYUSERNAME => $proxy['username'],
                CURLOPT_PROXYPASSWORD => $proxy['password'],
                CURLOPT_CONNECT_ONLY => true,
                CURLOPT_CONNECTTIMEOUT => self::TIMEOUT,
                CURLOPT_TIMEOUT => self::TIMEOUT,
                CURLOPT_NOSIGNAL => true,
            ]);

            return curl_exec($curl) !== false;
        } finally {
            curl_close($curl);
        }
    }
}
