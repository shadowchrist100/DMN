<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrganizationValidatedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $organizationName,
        private readonly string $status,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = $this->status === 'active'
            ? 'Organisation approuvée — Dossier Médical National'
            : 'Organisation suspendue — Dossier Médical National';

        $lines = $this->status === 'active'
            ? [
                "Votre organisation « {$this->organizationName} » a été approuvée par notre équipe.",
                "Elle est désormais active et accessible sur la plateforme.",
            ]
            : [
                "Votre organisation « {$this->organizationName} » a été suspendue.",
                "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe de support.",
            ];

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Bonjour,')
            ->line($lines[0])
            ->line($lines[1])
            ->action('Accéder au tableau de bord', config('app.frontend_url', 'http://localhost:4200') . '/admin/organizations')
            ->line("Cordialement, l'équipe du Dossier Médical National.");
    }
}
