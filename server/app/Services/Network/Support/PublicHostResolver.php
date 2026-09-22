<?php

namespace App\Services\Network\Support;

use Illuminate\Http\Client\ConnectionException;
use InvalidArgumentException;

class PublicHostResolver
{
    public function resolve(string $host): string
    {
        $addresses = $this->resolveAddresses($host);

        if ($addresses === []) {
            throw new ConnectionException('Не удалось определить IP-адрес ресурса');
        }

        foreach ($addresses as $address) {
            if (!$this->isPublicIp($address)) {
                throw new InvalidArgumentException('Этот адрес недоступен для проверки');
            }
        }

        return $this->selectAddress($addresses);
    }

    private function resolveAddresses(string $host): array
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return [$host];
        }

        $records = dns_get_record($host, DNS_A | DNS_AAAA);

        if ($records === false) {
            return [];
        }

        $addresses = [];

        foreach ($records as $record) {
            if (isset($record['ip'])) {
                $addresses[] = $record['ip'];
            }

            if (isset($record['ipv6'])) {
                $addresses[] = $record['ipv6'];
            }
        }

        return array_values(array_unique($addresses));
    }

    private function selectAddress(array $addresses): string
    {
        foreach ($addresses as $address) {
            if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
                return $address;
            }
        }

        return $addresses[0];
    }

    private function isPublicIp(string $ip): bool
    {
        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
        ) !== false;
    }
}
