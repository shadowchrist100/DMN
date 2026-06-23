<?php

namespace App\Services;

use App\Exceptions\MedicalServiceException;
use Illuminate\Support\Facades\Http;

class MedicalServiceClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.medical.base_url', 'http://localhost:8082');
    }

    public function createPatient(array $data): array
    {
        try {
            $response = Http::timeout(10)->post("{$this->baseUrl}/api/patients", $data);

            if ($response->failed()) {
                throw new MedicalServiceException(
                    'Erreur lors de la création du profil patient.',
                    $response->status()
                );
            }

            return $response->json();
        } catch (MedicalServiceException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new MedicalServiceException(
                'Le service médical est temporairement indisponible.',
                503,
                $e
            );
        }
    }

    public function createPractitioner(array $data): array
    {
        try {
            $response = Http::timeout(10)->post("{$this->baseUrl}/api/practitioners", $data);

            if ($response->failed()) {
                throw new MedicalServiceException(
                    'Erreur lors de la création du profil praticien.',
                    $response->status()
                );
            }

            return $response->json();
        } catch (MedicalServiceException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new MedicalServiceException(
                'Le service médical est temporairement indisponible.',
                503,
                $e
            );
        }
    }

    public function createPatientDMN(string $userId): array
    {
        $apiKey = config('services.medical.internal_api_key', '');
        try {
            $response = Http::timeout(10)
                ->withHeader('X-API-Key', $apiKey)
                ->post("{$this->baseUrl}/api/patients/by-user/{$userId}/dmn");

            if ($response->failed()) {
                throw new MedicalServiceException(
                    'Erreur lors de la création du DMN : ' . $response->body(),
                    $response->status()
                );
            }

            return $response->json();
        } catch (MedicalServiceException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new MedicalServiceException(
                'Le service médical est temporairement indisponible.',
                503,
                $e
            );
        }
    }

    public function createEmergencyAuthorization(
        string $patientUserId,
        string $practitionerUserId,
        string $typeAutorisation,
        string $auteurId,
    ): array {
        $apiKey = config('services.medical.internal_api_key', '');
        try {
            $response = Http::timeout(10)
                ->withHeader('X-API-Key', $apiKey)
                ->post("{$this->baseUrl}/api/internal/authorizations/urgence", [
                    'patient_user_id' => $patientUserId,
                    'practitioner_user_id' => $practitionerUserId,
                    'type_autorisation' => $typeAutorisation,
                    'auteur_id' => $auteurId,
                ]);

            if ($response->failed()) {
                throw new MedicalServiceException(
                    'Erreur lors de la création de l\'autorisation d\'urgence.',
                    $response->status()
                );
            }

            return $response->json();
        } catch (MedicalServiceException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new MedicalServiceException(
                'Le service médical est temporairement indisponible.',
                503,
                $e
            );
        }
    }
}
