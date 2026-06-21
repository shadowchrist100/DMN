<?php

namespace App\Notifications;

use App\Models\EmergencyContact;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmergencyContactNotification extends Notification
{
    use Queueable;

    public function __construct(
        private EmergencyContact $contact,
        private string $token,
        private string $code,
        private string $practitionerName,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:4200');
        $validationUrl = "{$frontendUrl}/urgence/valider?token={$this->token}&code={$this->code}";

        return (new MailMessage)
            ->subject('Urgence médicale — Accès au dossier médical')
            ->greeting("Bonjour {$this->contact->first_name} {$this->contact->last_name},")
            ->line("Le Dr. {$this->practitionerName} a déclenché un protocole d'urgence pour accéder au dossier médical de votre proche.")
            ->line('Pour autoriser cet accès, cliquez sur le bouton ci-dessous et saisissez le code de vérification.')
            ->action('Autoriser l\'accès', $validationUrl)
            ->line("Votre code de vérification : **{$this->code}**")
            ->line('Ce lien expire dans 3 minutes.')
            ->line('Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email.');
    }
}
