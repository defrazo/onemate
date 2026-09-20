<?php

namespace App\Services\Network;

class SslCheckService
{
    private const PORT = 443;

    private const TIMEOUT = 5;

    public function __construct(private readonly PublicHostResolver $hostResolver)
    {
    }

    public function check(string $host): array
    {
        $ip = $this->hostResolver->resolve($host);

        $context = stream_context_create([
            'ssl' => [
                'capture_peer_cert' => true,
                'verify_peer' => true,
                'verify_peer_name' => true,
                'peer_name' => $host,
                'SNI_enabled' => true,
            ],
        ]);

        $connection = @stream_socket_client(
            "ssl://{$ip}:" . self::PORT,
            $errorCode,
            $errorMessage,
            self::TIMEOUT,
            STREAM_CLIENT_CONNECT,
            $context,
        );

        if ($connection === false) {
            return [
                'host' => $host,
                'status' => 'invalid',
                'issuer' => null,
                'validFrom' => null,
                'validTo' => null,
                'daysRemaining' => null,
                'ip' => $ip,
            ];
        }

        $params = stream_context_get_params($connection);

        fclose($connection);

        $certificate = $params['options']['ssl']['peer_certificate'] ?? null;

        if ($certificate === null) {
            return [
                'host' => $host,
                'status' => 'invalid',
                'issuer' => null,
                'validFrom' => null,
                'validTo' => null,
                'daysRemaining' => null,
                'ip' => $ip,
            ];
        }

        $details = openssl_x509_parse($certificate);

        if ($details === false) {
            return [
                'host' => $host,
                'status' => 'invalid',
                'issuer' => null,
                'validFrom' => null,
                'validTo' => null,
                'daysRemaining' => null,
                'ip' => $ip,
            ];
        }

        $validFrom = $details['validFrom_time_t'] ?? null;
        $validTo = $details['validTo_time_t'] ?? null;

        return [
            'host' => $host,
            'status' => 'valid',
            'issuer' => $this->getIssuer($details),
            'validFrom' => $validFrom !== null
                ? date(DATE_ATOM, $validFrom)
                : null,
            'validTo' => $validTo !== null
                ? date(DATE_ATOM, $validTo)
                : null,
            'daysRemaining' => $validTo !== null
                ? max(0, (int) floor(($validTo - time()) / 86400))
                : null,
            'ip' => $ip,
        ];
    }

    private function getIssuer(array $details): ?string
    {
        $issuer = $details['issuer'] ?? [];

        return $issuer['O']
            ?? $issuer['CN']
            ?? null;
    }
}
