<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Factories\RegistrationFactory;

class UserService
{
    private RegistrationFactory $factory;

    public function __construct(RegistrationFactory $factory)
    {
        $this->factory = $factory;
    }

    public function register(array $data): User
    {
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'firstName' => data_get($data, 'identity.firstName') ,
                'email' => data_get($data, 'auth.email') ,
                'lastName' => data_get($data, 'identity.lastName') ,
                'npi' => data_get($data, 'identity.npi') ,
                'genre' => data_get($data, 'identity.genre') ,
                'birthDate' => data_get($data, 'identity.birthDate') ,
                'photo_path' => data_get($data, 'identity.photo_path') ,
                'password' => data_get($data, 'auth.password') ,
                'phone' => data_get($data, 'identity.phone'),
            ]);

            $strategy = $this->factory->getStrategy($data['user_type']);
            $user = $strategy->create($user, $data);
            return $user;
        });

        return $user;
    }
}
