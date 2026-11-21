<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['service', 'login', 'password', 'comment', 'url', 'color', 'order_idx'])]
#[Hidden(['password'])]
class UserCredential extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['password' => 'encrypted', 'order_idx' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
