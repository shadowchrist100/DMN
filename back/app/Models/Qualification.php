<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Qualification extends Model
{
    //
    protected $fillable = [ 
        'practitioner_id',
        'code',
        'nom',
        'speciality',
        'type',
        'debut_validite',
        'fin_validite'
    ];

    public function practitioner():BelongsTo{
        return $this->belongsTo(Practitioner::class);
    }

}
