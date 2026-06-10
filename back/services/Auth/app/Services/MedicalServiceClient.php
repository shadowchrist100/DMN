<?php

namespace App\Services;

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
        $response = Http::post("{$this->baseUrl}/api/patients", $data);

        if ($response->failed()) {
            throw new \RuntimeException(
                'Erreur lors de la création du patient : ' . $response->body()
            );
        }

        return $response->json();
    }

    public function createPractitioner(array $data): array
    {
        $response = Http::post("{$this->baseUrl}/api/practitioners", $data);

        if ($response->failed()) {
            throw new \RuntimeException(
                'Erreur lors de la création du praticien : ' . $response->body()
            );
        }

        return $response->json();
    }
}
