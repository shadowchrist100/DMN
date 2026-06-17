<?php

namespace App\Exceptions;

use Exception;

class MedicalServiceException extends Exception
{
    public function __construct(
        string $message = 'Service médical indisponible.',
        int $code = 503,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
