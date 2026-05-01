<?php

namespace App\Strategies;

use App\Models\User;
use App\Strategies\UserRegistration;


class PatientRegistration implements UserRegistration {

    public function create(User $user, array $data):User{
        $user->patient()->create(array_intersect_key($data, array_flip(['matrimonialStatus'])));
        $user->patient()->related_persons()->create(array_intersect_key(data_get($data, 'emergencyContact') , array_flip(['firstName','lastName', 'genre', 'birthDate'])));
        return $user;
    }

}