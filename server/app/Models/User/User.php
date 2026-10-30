<?php

namespace App\Models\User;

use App\Models\Cloud\CloudFile;
use App\Models\Kanban\KanbanColumn;
use App\Models\Kanban\KanbanTask;
use App\Models\Network\MonitoredService;
use App\Models\Todo\TodoCanvas;
use App\Notifications\User\ResetPasswordNotification;
use App\Notifications\User\VerifyEmailNotification;
use App\Notifications\User\VerifyPendingEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

#[Fillable(['username', 'email', 'password', 'role', 'privacy_accepted_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    /** @use HasFactory<UserFactory> */
    use HasFactory;
    use HasUuids;
    use Notifiable;

    protected function casts(): array
    {
        return [
            'privacy_accepted_at' => 'datetime',
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'deleted_at' => 'datetime',
            'pending_email_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(UserNote::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(UserLocation::class);
    }

    public function authLogs(): HasMany
    {
        return $this->hasMany(UserAuthLog::class);
    }

    public function kanbanColumns(): HasMany
    {
        return $this->hasMany(KanbanColumn::class);
    }

    public function todoCanvases(): HasMany
    {
        return $this->hasMany(TodoCanvas::class);
    }

    public function kanbanTasks(): HasMany
    {
        return $this->hasMany(KanbanTask::class);
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }

    public function sendPendingEmailVerificationNotification(): void
    {
        if (!$this->pending_email) {
            return;
        }

        $this->notify(new VerifyPendingEmailNotification);
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    public function monitoredServices(): HasMany
    {
        return $this->hasMany(MonitoredService::class);
    }

    public function cloudFiles(): HasMany
    {
        return $this->hasMany(CloudFile::class);
    }
}
