<?php

namespace App\Strategies;

use App\Models\User;

class PatientRegistration implements UserRegistration
{
    public function create(User $user, array $data): User
    {
        $user->update([
            'role' => 'patient',
            'status_account' => 'unverified',
        ]);

        if (isset($data['documents']) && is_array($data['documents'])) {
            foreach ($data['documents'] as $doc) {
                if (isset($doc['file']) && isset($doc['type_document'])) {
                    $path = $doc['file']->store('documents', 'public');
                    $user->identityDocuments()->create([
                        'type_document' => $doc['type_document'],
                        'file_path' => $path,
                    ]);
                }
            }
        }

        return $user;
    }
}
