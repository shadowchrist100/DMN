<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Qualification extends Model
{
    //
    protected $fillable = [ 
        'practitioner_id',
        'code',
        'nom',
        'specialite',
        'type',
        'debut_validite',
        'fin_validite'
    ];
}
