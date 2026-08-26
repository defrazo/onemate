<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 30;

    protected function verificationUrl($notifiable): string
    {
        $signedBackendUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
                'type' => 'register',
            ],
            absolute: false,
        );

        $query = parse_url($signedBackendUrl, PHP_URL_QUERY);

        return sprintf(
            '%s/email/verify/%s/%s?%s',
            rtrim(config('app.frontend_url'), '/'),
            $notifiable->getKey(),
            sha1($notifiable->getEmailForVerification()),
            $query,
        );
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Подтвердите e-mail в OneMate')
            ->view('emails.verify-email', [
                'url' => $this->verificationUrl($notifiable),
            ]);
    }
}
