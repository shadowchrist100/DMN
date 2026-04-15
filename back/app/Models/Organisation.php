<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Organisation extends Model
{
    //
    protected $fillable = [
        'est_actif',
        'type',
        'nom',
        'alias',
        'description',
        'part_of',
        'contrat',
        'qualification'
    ];
}
