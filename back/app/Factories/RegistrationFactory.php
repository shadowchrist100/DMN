<?php

namespace App\Factories;
use App\Strategies\PatientRegistration;
use App\Strategies\UserRegistration;
use App\Strategies\PractitionerRegistration;

class RegistrationFactory {

    public function getStrategy(string $user_type): UserRegistration{
        switch ($user_type) {
            case 'patient':
                return new PatientRegistration();
            case 'practitioner':
                return new PractitionerRegistration();
            default:
                throw new \Exception('User type inconnu', 1);
        }
    }
}