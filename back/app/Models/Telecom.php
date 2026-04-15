<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Telecom extends Model
{
    //
    protected $fillable = [
        'owner_id',
        'owner_type',
        'system',
        'value',
        'use',
        'rank'
    ];
}
