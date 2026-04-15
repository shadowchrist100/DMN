<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    //
    protected $fillable = [ 
        'est_actif',
        'nom',
        'prenom',
        'genre',
        'date_naissance',
        'deces_at',
        'adresse_json',
        'situation_matimoniale',
        'multiple_birth', // si jumeau ou position de naissance
        'photo_path',
    ];
}
