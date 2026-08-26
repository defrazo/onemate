<?php

namespace App\Providers;

use GuzzleHttp\Client as GuzzleClient;
use Illuminate\Mail\MailManager;
use Illuminate\Mail\Transport\ResendTransport;
use Illuminate\Support\ServiceProvider;
use Resend\Client;
use Resend\Transporters\HttpTransporter;
use Resend\ValueObjects\ApiKey;
use Resend\ValueObjects\Transporter\BaseUri;
use Resend\ValueObjects\Transporter\Headers;

class ResendServiceProvider extends ServiceProvider
{
    public function boot(MailManager $mailManager): void
    {
        $mailManager->extend('resend_custom', function (array $config) {
            $apiKey = ApiKey::from($config['key'] ?? config('services.resend.key'));

            $httpClient = new GuzzleClient([
                'timeout' => 15,
                'connect_timeout' => 5,
                'headers' => [
                    'Connection' => 'close',
                ],
            ]);

            $client = new Client(
                new HttpTransporter(
                    $httpClient,
                    BaseUri::from('api.resend.com'),
                    Headers::withAuthorization($apiKey),
                ),
            );

            return new ResendTransport($client);
        });
    }
}
