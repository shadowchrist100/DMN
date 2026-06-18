<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;

trait HandlesDocumentUploads
{
    protected function storeDocumentFile(UploadedFile $file, string $typeDocument): string
    {
        return $file->store('documents/' . $typeDocument, 'local');
    }
}
