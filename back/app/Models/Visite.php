<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visite extends Model
{
    //
    protected $fillable = [
        'patient_id',
        'organisation_id',
        'status',
        'type',
        'priorite',
        'debut_reel',
        'fin_reel',
        'motif_code'
    ];
}
