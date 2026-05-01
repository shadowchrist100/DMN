<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    //
    use HasUuids;
    protected $fillable = [ 
        'user_id',
        'deces_at',
        'adresse_json',
        'situation_matrimoniale',
        'multiple_birth', // si jumeau ou position de naissance
    ];

    protected $casts = [
        'adresse_json' => 'array',
        'deces_at' => 'date'
    ];

    public function user():BelongsTo{
        return $this->belongsTo(User::class);
    }

    public function related_persons():HasMany{
        return $this->hasMany(RelatedPerson::class);
    }

}
