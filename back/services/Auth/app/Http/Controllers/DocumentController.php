<?php

namespace App\Http\Controllers;

use App\Models\IdentityDocument;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function getUserDocuments(User $user): JsonResponse
    {
        $documents = $user->identityDocuments()->get()->map(fn($doc) => [
            'id' => $doc->id,
            'type_document' => $doc->type_document,
            'file_name' => basename($doc->file_path),
            'url' => url("/api/users/{$user->id}/documents/{$doc->id}"),
        ]);

        return response()->json(['documents' => $documents]);
    }

    public function download(IdentityDocument $document)
    {
        if (!Storage::disk('local')->exists($document->file_path)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        return Storage::disk('local')->download($document->file_path);
    }
}
