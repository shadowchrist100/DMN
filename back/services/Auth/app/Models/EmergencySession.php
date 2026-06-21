<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmergencySession extends Model
{
    use HasUuids;

    protected $fillable = [
        'patient_user_id',
        'practitioner_user_id',
        'expires_at',
        'status',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_user_id');
    }

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'practitioner_user_id');
    }

    public function contactTokens(): HasMany
    {
        return $this->hasMany(EmergencyContactToken::class, 'emergency_session_id');
    }
}
