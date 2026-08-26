<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyPendingEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 30;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Подтвердите новый e-mail в OneMate')
            ->view('emails.verify-new-email', [
                'url' => $this->verificationUrl($notifiable),
            ]);
    }

    protected function verificationUrl(object $notifiable): string
    {
        $pendingEmail = (string) $notifiable->pending_email;
        $hash = sha1($pendingEmail);

        $signedBackendUrl = URL::temporarySignedRoute(
            'pending-email.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => $hash,
                'type' => 'pending',
            ],
            absolute: false,
        );

        $query = parse_url($signedBackendUrl, PHP_URL_QUERY);

        return sprintf(
            '%s/email/verify/%s/%s?%s',
            rtrim(config('app.frontend_url'), '/'),
            $notifiable->getKey(),
            $hash,
            $query,
        );
    }
}
