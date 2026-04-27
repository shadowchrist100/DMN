<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;




class Patient extends Model
{
    //
    use HasUuids;
    protected $fillable = [ 
        'est_actif',
        'nom',
        'prenom',
        'npi',
        'genre',
        'date_naissance',
        'deces_at',
        'adresse_json',
        'situation_matrimoniale',
        'multiple_birth', // si jumeau ou position de naissance
        'photo_path',
    ];

    protected $casts = [
        'adresse_json' => 'array',
        'est_actif' => 'boolean',
        'date_naissance' => 'date',
        'deces_at' => 'date'
    ];
}
