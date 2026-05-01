<?php

namespace App\Strategies;

use App\Models\User;


interface UserRegistration
{
    public function create(User $user, array $data): User;
}
