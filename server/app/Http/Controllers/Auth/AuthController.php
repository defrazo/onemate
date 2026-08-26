<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class AuthController extends Controller
{
    public function verifyInvite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'invite_code' => ['required', 'string'],
        ]);

        $inviteCode = config('app.register_invite_code');

        if (!$inviteCode || !hash_equals((string) $inviteCode, (string) $data['invite_code'])) {
            return response()->json([
                'code' => 'INVALID_INVITE',
            ], 422);
        }

        $token = Str::random(64);

        cache()->put('invite_token:' . hash('sha256', $token), true, now()->addMinutes(10));

        return response()->json([
            'invite_token' => $token,
        ]);
    }

    public function session(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user('sanctum');

        return response()->json([
            'authenticated' => $user !== null,
            'user' => $user,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'invite_token' => ['required', 'string'],
            'privacy_accepted' => ['accepted'],
            'username' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-zA-Z0-9_-]+$/', 'unique:users,username'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'confirmed',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers(),
                'not_regex:/[А-Яа-яЁё]/u',
            ],
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();

            $code = match (true) {
                $errors->has('invite_token') => 'INVALID_INVITE',
                $errors->has('privacy_accepted') => 'PRIVACY_NOT_ACCEPTED',
                $errors->has('username') => 'INVALID_USERNAME',
                $errors->has('email') && str_contains($errors->first('email'), 'taken') => 'EMAIL_TAKEN',
                $errors->has('email') => 'INVALID_EMAIL',
                $errors->has('password') => 'INVALID_PASSWORD',
                default => 'REGISTRATION_ERROR',
            };

            return response()->json([
                'code' => $code,
            ], 422);
        }

        $data = $validator->validated();

        $inviteTokenKey = 'invite_token:' . hash('sha256', $data['invite_token']);

        if (!cache()->pull($inviteTokenKey)) {
            return response()->json([
                'code' => 'INVALID_INVITE',
            ], 422);
        }

        $user = User::create([
            'username' => trim($data['username']),
            'email' => mb_strtolower(trim($data['email'])),
            'password' => $data['password'],
            'role' => 'user',
            'privacy_accepted_at' => now(),
        ]);

        $user->profile()->create();

        $user->sendEmailVerificationNotification();

        return response()->json([
            'code' => 'REGISTER_SUCCESS',
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => 'INVALID_CREDENTIALS',
            ], 422);
        }

        $data = $validator->validated();

        $login = mb_strtolower(trim($data['login']));

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$login])
            ->orWhereRaw('LOWER(username) = ?', [$login])
            ->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'code' => 'INVALID_CREDENTIALS',
            ], 422);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'code' => 'EMAIL_NOT_VERIFIED',
            ], 403);
        }

        Auth::guard('web')->login($user);

        $request->session()->regenerate();

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        return response()->json([
            'code' => 'LOGIN_SUCCESS',
            'user' => $user,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'code' => 'LOGGED_OUT',
        ]);
    }
}
