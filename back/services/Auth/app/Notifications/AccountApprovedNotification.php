<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly User $user,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $role = match ($this->user->role) {
            'patient' => 'patient',
            'practitioner' => 'praticien',
            'admin_organisation' => "administrateur d'organisation",
            default => $this->user->role,
        };

        return (new MailMessage)
            ->subject('Compte approuvé — Dossier Médical National')
            ->greeting("Bonjour {$this->user->first_name},")
            ->line("Votre compte en tant que {$role} a été approuvé par notre équipe.")
            ->line("Vous pouvez dès à présent vous connecter et accéder à toutes les fonctionnalités de la plateforme.")
            ->action('Se connecter', config('app.frontend_url', 'http://localhost:4200') . '/login')
            ->line("Si vous n'avez pas créé de compte, ignorez cet email.");
    }
}
