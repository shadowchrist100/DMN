<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'npi' => $data['npi'],
                'gender' => $data['gender'],
                'birth_date' => $data['birth_date'],
                'photo_path' => $data['photo_path'] ?? null,
                'phone' => $data['phone'],
                'matrimonial_status' => $data['matrimonial_status'],
                'city' => $data['city'] ?? null,
                'address' => $data['address'] ?? null,
                'role' => $data['role'],
                'status_account' => 'unverified',
            ]);

            $strategy = $this->factory->getStrategy($data['role']);
            $strategy->create($user, $data);

            return $user;
        });

        $this->sendToMedical($user, $data);

        return $user;
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
            $payload = $strategy->getMedicalPayload($user, $data);

            $this->callMedicalEndpoint($data['role'], $payload);
        } catch (\InvalidArgumentException) {
            // admin ou rôle inconnu → pas de profil Medical
        } catch (\Exception $e) {
            Log::error('Création du profil Medical échouée pour l\'utilisateur ' . $user->id, [
                'error' => $e->getMessage(),
                'role' => $data['role'],
            ]);

            $user->update(['status_account' => 'sync_failed']);
        }
    }

    public function retrySync(User $user): void
    {
        if (!in_array($user->status_account, ['sync_failed', 'verification_failed'], true)) {
            return;
        }

        try {
            $strategy = $this->factory->getStrategy($user->role);
            $payload = $strategy->getMedicalPayload($user, []);

            $this->callMedicalEndpoint($user->role, $payload);

            $user->update(['status_account' => 'unverified']);
        } catch (\Exception $e) {
            Log::error('Nouvel échec de synchronisation Medical pour l\'utilisateur ' . $user->id, [
                'error' => $e->getMessage(),
            ]);
        }
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
