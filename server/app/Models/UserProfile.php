<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'avatar_url',
    'first_name',
    'last_name',
    'birth_date',
    'gender',
    'location',
    'phones',
    'additional_emails',
    'theme',
    'widgets_sequence',
    'widgets_slots',
])]
class UserProfile extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return [
            'birth_date' => 'date:Y-m-d',
            'phones' => 'array',
            'additional_emails' => 'array',
            'widgets_sequence' => 'array',
            'widgets_slots' => 'array',
            'password_changed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
