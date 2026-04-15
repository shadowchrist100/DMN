<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Practicien extends Model
{
    //
    protected $fillable = [
        'est_actif',
        'nom',
        'prenom',
        'genre',
        'date_naissance',
        'addresse_json',
        'photo_path'
    ];
}
