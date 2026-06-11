<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Factories\RegistrationFactory;

class UserService
{
    private RegistrationFactory $factory;
    private MedicalServiceClient $medicalClient;

    public function __construct(RegistrationFactory $factory, MedicalServiceClient $medicalClient)
    {
        $this->factory = $factory;
        $this->medicalClient = $medicalClient;
    }

    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $fields = ['first_name', 'last_name', 'email', 'password', 'npi', 'gender', 'birth_date', 'photo_path', 'phone', 'matrimonial_status', 'city', 'address', 'role', 'status_account'];

            $user = User::create(array_intersect_key($data, array_flip($fields)));

            $strategy = $this->factory->getStrategy($data['role']);
            $strategy->create($user, $data);

            $this->sendToMedical($user, $data);

            return $user;
        });
    }

    public function verifyUser(string $userId): User
    {
        $user = User::findOrFail($userId);

        if ($user->status_account === 'verified') {
            throw new \RuntimeException('Ce compte est déjà vérifié.');
        }

        $user->update(['status_account' => 'verified']);

        return $user;
    }

    private function sendToMedical(User $user, array $data): void
    {
        try {
            $strategy = $this->factory->getStrategy($data['role']);
        } catch (\InvalidArgumentException) {
            return;
        }

        $payload = $strategy->getMedicalPayload($user, $data);
        $this->callMedicalEndpoint($user->role, $payload);
    }

    private function callMedicalEndpoint(string $role, array $payload): void
    {
        if ($role === 'patient') {
            $this->medicalClient->createPatient($payload);
        } elseif ($role === 'practitioner') {
            $this->medicalClient->createPractitioner($payload);
        }
    }
}
