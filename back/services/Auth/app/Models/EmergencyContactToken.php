<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyContactToken extends Model
{
    use HasUuids;

    protected $fillable = [
        'emergency_session_id',
        'emergency_contact_id',
        'token',
        'code',
        'used',
    ];

    protected $casts = [
        'used' => 'boolean',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(EmergencySession::class, 'emergency_session_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(EmergencyContact::class, 'emergency_contact_id');
    }
}
