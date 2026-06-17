<?php

namespace App\Strategies;

use App\Models\User;
use App\Traits\HandlesDocumentUploads;

class PatientRegistration implements UserRegistration
{
    use HandlesDocumentUploads;

    public function create(User $user, array $data): User
    {
        $this->storeDocuments($user, $data);

        return $user;
    }

    public function getMedicalPayload(User $user, array $data): array
    {
        return [
            'user_id'  => (string) $user->id,
            'relative' => [
                'first_name'    => $data['emergencyContact']['firstName'] ?? null,
                'last_name'     => $data['emergencyContact']['lastName'] ?? null,
                'phone'         => $data['emergencyContact']['phone'] ?? null,
                'code_relation' => $data['emergencyContact']['code_relation'] ?? null,
            ],
        ];
    }

    private function storeDocuments(User $user, array $data): void
    {
        if (!isset($data['documents']) || !is_array($data['documents'])) {
            return;
        }

        foreach ($data['documents'] as $doc) {
            if (!isset($doc['file']) || !isset($doc['type_document'])) {
                continue;
            }
            $path = $this->storeDocumentFile($doc['file'], $doc['type_document']);
            $user->identityDocuments()->create([
                'type_document' => $doc['type_document'],
                'file_path' => $path,
            ]);
        }
    }
}
