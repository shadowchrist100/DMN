<?php

namespace App\Services;

use App\Exceptions\MedicalServiceException;
use Illuminate\Support\Facades\Http;

class MedicalOrganizationServiceClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.medical.base_url', 'http://localhost:8080');
    }

    public function create(array $data): array
    {
        return $this->request('POST', '/api/organizations', $data);
    }

    public function list(array $params = []): array
    {
        return $this->request('GET', '/api/organizations', $params);
    }

    public function show(string $id): array
    {
        return $this->request('GET', "/api/organizations/{$id}");
    }

    public function update(string $id, array $data): array
    {
        return $this->request('PUT', "/api/organizations/{$id}", $data);
    }

    public function destroy(string $id): array
    {
        return $this->request('DELETE', "/api/organizations/{$id}");
    }

    public function validate(string $id, array $data): array
    {
        return $this->request('POST', "/api/organizations/{$id}/validate", $data);
    }

    private function request(string $method, string $path, array $data = []): array
    {
        try {
            $token = auth()->getToken()?->get();

            $http = Http::timeout(10);

            if ($token) {
                $http->withToken($token);
            }

            if ($method === 'GET') {
                $response = $http->get("{$this->baseUrl}{$path}", $data);
            } else {
                $response = $http->send($method, "{$this->baseUrl}{$path}", ['json' => $data]);
            }

            if ($response->failed()) {
                throw new MedicalServiceException(
                    $response->json('message') ?? 'Erreur lors de la communication avec le service médical.',
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
