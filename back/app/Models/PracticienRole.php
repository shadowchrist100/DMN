<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticienRole extends Model
{
    //
    protected $fillable = [
        'practicien_id',
        'organisation_id',
        'est_actif',
        'code_role',
        'debut_validite',
        'fin_validite'
    ];
}
