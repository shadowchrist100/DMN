<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiagnosticReports extends Model
{
    //
    protected $fillable = [
        'statut',
        'categorie',
        'code',
        'patient_id',
        'visite_id',
        'effective_at',
        'publie',
        'practicien_id',
        'conclusion',
        'resultats_observation'
    ];
}
