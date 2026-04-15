<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RelatedPerson extends Model
{
    //
    protected $fillable = [
        'patient_id',
        'est_actif',
        'relationship_code',
        'nom',
        'prenom',
        'genre',
        'date_naissance',
        'adresse_json',
        'photo_path'
    ];
}
