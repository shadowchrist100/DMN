<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Practitioner extends Model
{
    //
    protected $fillable = [
        'user_id',
        'qualification_id',
        'addresse_json',
    ];

    public function user():BelongsTo{
        return $this->belongsTo(User::class);
    }

    public function organisations():HasMany{
        return $this->hasMany(Organisation::class);
    }

    public function qualification():HasOne{
        return $this->hasOne(Qualification::class);
    }


}
