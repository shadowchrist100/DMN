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
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'npi' => $data['npi'] ?? null,
                'genre' => $data['genre'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'photo_path' => $data['photo_path'] ?? null,
                'phone' => $data['phone'] ?? null,
                'matrimonial_status' => $data['matrimonial_status'] ?? null,
                'city' => $data['city'] ?? null,
                'address' => $data['address'] ?? null,
                'status_account' => 'unverified',
            ]);

            $strategy = $this->factory->getStrategy($data['user_type']);
            $strategy->create($user, $data);

            return $user;
        });
    }

    public function verifyUser(int $userId): User
    {
        return DB::transaction(function () use ($userId) {
            $user = User::findOrFail($userId);

            if ($user->status_account === 'verified') {
                throw new \RuntimeException('Ce compte est déjà vérifié.');
            }

            $user->update(['status_account' => 'verified']);

            $medicalData = [
                'user_id' => (string) $user->id,
            ];

            if ($user->role === 'patient') {
                $this->medicalClient->createPatient($medicalData);
            } elseif ($user->role === 'practitioner') {
                $medicalData['speciality'] = $user->speciality;
                $medicalData['order_number'] = $user->order_number;
                $medicalData['organization_name'] = $user->organization_name;
                $this->medicalClient->createPractitioner($medicalData);
            }

            return $user;
        });
    }
}
