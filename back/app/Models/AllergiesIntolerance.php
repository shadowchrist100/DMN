<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AllergiesIntolerance extends Model
{
    //
    protected $fillable = [
        'patient_id',
        'type',
        'categorie',
        'substance_code',
        'criticite',
        'statut_clinique',
        'reactions_json'
    ];
}
