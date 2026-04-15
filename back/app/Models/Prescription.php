<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    //
    protected $fillable = [
        'patient_id',
        'practicien_id',
        'visite_id',
        'nom_medicament',
        'statut',
        'date_prescription',
        'posologie_json',
    ];  
}
