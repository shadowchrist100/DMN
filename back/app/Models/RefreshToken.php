<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefreshToken extends Model
{
    //
    protected $fillable=[
        'user_id',
        'refresh_token_hash',
        'revoke',
    ];
}
