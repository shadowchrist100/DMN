<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Condition extends Model
{
    //
    protected $fillable = [
        'patient_id',
        'visite_id',
        'code_diagnostic',
        'nom_diagonstic',
        'statut_clinique',
        'statut_verification',
        'severite',
        'date_apparition',
        'date_resolution',
        'practicien_id'
    ];
}
