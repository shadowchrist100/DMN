<?php

namespace App\Services;

use App\Exceptions\MedicalServiceException;
use Illuminate\Support\Facades\Http;

class MedicalServiceClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.medical.base_url', 'http://localhost:8001');
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
}
