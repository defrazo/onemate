<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AccountDeletionScheduledNotification;
use App\Notifications\AccountRestoredNotification;
use App\Notifications\EmailChangedNotification;
use App\Notifications\PasswordChangedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;

class UserAccountController extends Controller
{
    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password' => [
                'required',
                'string',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers(),
                'different:current_password',
                'not_regex:/[А-Яа-яЁё]/u',
            ],
        ]);

        /** @var User $user */
        $user = $request->user();

        $user->forceFill([
            'password' => Hash::make($data['password']),
            'remember_token' => Str::random(60),
        ])->save();

        if ($user->profile) {
            $user->profile->forceFill([
                'password_changed_at' => now(),
            ])->save();
        }

        $user->notify(new PasswordChangedNotification);

        return response()->json([
            'code' => 'PASSWORD_UPDATED',
            'user' => $user->fresh(),
        ]);
    }

    public function updateEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validate([
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($user->getKey()),
                Rule::unique('users', 'pending_email')
                    ->ignore($user->getKey()),
            ],
            'current_password' => ['required', 'string', 'current_password'],
        ]);

        $newEmail = mb_strtolower(trim($data['email']));

        if ($newEmail === mb_strtolower($user->email)) {
            return response()->json([
                'code' => 'EMAIL_UNCHANGED',
            ], 422);
        }

        if (
            $user->pending_email &&
            $newEmail === mb_strtolower($user->pending_email)
        ) {
            return response()->json([
                'code' => 'EMAIL_VERIFICATION_PENDING',
                'user' => $user->fresh(),
            ]);
        }

        $user->forceFill([
            'pending_email' => $newEmail,
            'pending_email_expires_at' => now()->addHour(),
        ])->save();

        $user->sendPendingEmailVerificationNotification();

        return response()->json([
            'code' => 'EMAIL_VERIFICATION_SENT',
            'user' => $user->fresh(),
        ]);
    }

    public function verifyPendingEmail(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (!$user->pending_email) {
            return response()->json([
                'code' => 'NO_PENDING_EMAIL',
            ], 422);
        }

        if (!$user->pending_email_expires_at || $user->pending_email_expires_at->isPast()) {
            $user->forceFill([
                'pending_email' => null,
                'pending_email_expires_at' => null,
            ])->save();

            return response()->json([
                'code' => 'PENDING_EMAIL_EXPIRED',
            ], 410);
        }

        if (!hash_equals($hash, sha1($user->pending_email))) {
            abort(403);
        }

        $oldEmail = $user->email;
        $newEmail = $user->pending_email;

        if (
            User::where('email', $newEmail)
                ->whereKeyNot($user->getKey())
                ->exists()
        ) {
            return response()->json([
                'code' => 'EMAIL_TAKEN',
            ], 422);
        }

        $user->forceFill([
            'email' => $newEmail,
            'pending_email' => null,
            'pending_email_expires_at' => null,
            'email_verified_at' => now(),
        ])->save();

        $user->notify(new EmailChangedNotification($oldEmail));

        return response()->json([
            'code' => 'EMAIL_UPDATED',
            'user' => $user->fresh(),
        ]);
    }

    public function resendPendingEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user->pending_email) {
            return response()->json([
                'code' => 'NO_PENDING_EMAIL',
            ], 422);
        }

        $user->forceFill([
            'pending_email_expires_at' => now()->addHour(),
        ])->save();

        $user->sendPendingEmailVerificationNotification();

        return response()->json([
            'code' => 'OK',
            'user' => $user->fresh(),
        ]);
    }

    public function cancelPendingEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user->pending_email) {
            return response()->json([
                'code' => 'NO_PENDING_EMAIL',
            ], 422);
        }

        $user->forceFill([
            'pending_email' => null,
            'pending_email_expires_at' => null,
        ])->save();

        return response()->json([
            'code' => 'PENDING_EMAIL_CANCELLED',
            'user' => $user->fresh(),
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role === 'demo') {
            return response()->json([
                'code' => 'DEMO_ACCOUNT_PROTECTED',
            ], 403);
        }

        if ($user->deleted_at) {
            return response()->json([
                'code' => 'ACCOUNT_ALREADY_DELETED',
                'user' => $user->fresh(),
            ]);
        }

        $user->forceFill([
            'deleted_at' => now(),
        ])->save();

        $user->notify(new AccountDeletionScheduledNotification);

        return response()->json([
            'code' => 'ACCOUNT_DELETED',
            'user' => $user->fresh(),
        ]);
    }

    public function restore(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user->deleted_at) {
            return response()->json([
                'code' => 'ACCOUNT_NOT_DELETED',
            ], 422);
        }

        if ($user->deleted_at->lte(now()->subDays(30))) {
            return response()->json([
                'code' => 'ACCOUNT_RESTORE_EXPIRED',
            ], 410);
        }

        $user->forceFill([
            'deleted_at' => null,
        ])->save();

        $user->notify(new AccountRestoredNotification);

        return response()->json([
            'code' => 'ACCOUNT_RESTORED',
            'user' => $user->fresh(),
        ]);
    }
}
