<?php

namespace App\Strategies;

use App\Models\User;
use App\Strategies\UserRegistration;


class PractitionerRegistration implements UserRegistration {

    public function create(User $user, array $data):User{
        $user->practitioner()->create(array_intersect_key(data_get($data, 'practitioner'), array_flip(['speciality'])));
        $user->practitioner()->qualification()->create(array_intersect_key(data_get($data,'practitioner'),array_flip(['speciality'])));
        return $user;
    }

}