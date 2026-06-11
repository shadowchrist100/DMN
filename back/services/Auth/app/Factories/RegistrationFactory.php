<?php

namespace App\Factories;

use App\Strategies\PatientRegistration;
use App\Strategies\UserRegistration;
use App\Strategies\PractitionerRegistration;

class RegistrationFactory
{
    public function getStrategy(string $role): UserRegistration
    {
        return match ($role) {
            'patient' => new PatientRegistration(),
            'practitioner' => new PractitionerRegistration(),
            default => throw new \InvalidArgumentException("Type d'utilisateur inconnu : $role"),
        };
    }
}
