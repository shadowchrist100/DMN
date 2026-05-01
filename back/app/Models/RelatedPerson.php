<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RelatedPerson extends Model
{
    //
    protected $fillable = [
        'patient_id',
        'est_actif',
        'relationship_code',
        'firstName',
        'lastName',
        'genre',
        'birthDate',
        'adresse_json',
        'photo_path'
    ];

    public function patient():BelongsTo{
        return $this->belongsTo(Patient::class);
    }
}
