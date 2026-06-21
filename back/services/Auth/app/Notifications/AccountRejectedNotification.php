<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly User $user,
        private readonly string $reason,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Compte refusé — Dossier Médical National')
            ->greeting("Bonjour {$this->user->first_name},")
            ->line("Nous sommes désolés de vous informer que votre demande de création de compte a été refusée.")
            ->line("Motif : {$this->reason}")
            ->line("Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe de support.")
            ->line("Cordialement, l'équipe du Dossier Médical National.");
    }
}
