<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PasswordChangedNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = mb_strtolower(
            trim($request->string('email')->toString()),
        );

        Password::sendResetLink([
            'email' => $email,
        ]);

        return response()->json([
            'code' => 'OK',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'string',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers(),
                'not_regex:/[А-Яа-яЁё]/u',
            ],
            'password_confirmation' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'INVALID_PASSWORD_RESET',
            ], 422);
        }

        $data = $validator->validated();

        $status = Password::reset(
            [
                'email' => mb_strtolower(trim($data['email'])),
                'password' => $data['password'],
                'password_confirmation' => $data['password_confirmation'],
                'token' => $data['token'],
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                if ($user->profile) {
                    $user->profile->forceFill([
                        'password_changed_at' => now(),
                    ])->save();
                }

                $user->notify(new PasswordChangedNotification);

                event(new PasswordReset($user));
            },
        );

        return match ($status) {
            Password::PasswordReset => response()->json([
                'code' => 'PASSWORD_RESET',
            ]),

            Password::InvalidUser => response()->json([
                'code' => 'PASSWORD_RESET_INVALID_USER',
            ], 422),

            Password::InvalidToken => response()->json([
                'code' => 'PASSWORD_RESET_INVALID_TOKEN',
            ], 422),

            Password::ResetThrottled => response()->json([
                'code' => 'PASSWORD_RESET_THROTTLED',
            ], 429),

            default => response()->json([
                'code' => 'PASSWORD_RESET_FAILED',
            ], 422),
        };
    }
}
