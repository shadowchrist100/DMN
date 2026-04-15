<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Observation extends Model
{
    //
    protected $fillable = [
        'patient_id',
        'visite_id',
        'practicien_id',
        'status',
        'categorie',
        'code_standard',
        'valeur_json',
        'date_mesure'
    ];
}
