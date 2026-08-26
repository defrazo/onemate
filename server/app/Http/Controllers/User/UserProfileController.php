<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()
            ->profile()
            ->firstOrFail();

        return response()->json([
            'profile' => $profile,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'avatar_url' => ['nullable', 'string'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'gender' => [
                'nullable',
                'string',
                Rule::in(['male', 'female']),
            ],

            'location' => ['nullable', 'string', 'max:255'],
            'phones' => ['nullable', 'array'],
            'phones.*' => ['string'],
            'additional_emails' => ['nullable', 'array'],
            'additional_emails.*' => ['email'],
            'theme' => [
                'required',
                'string',
                Rule::in(['light', 'dark']),
            ],

            'widgets_sequence' => ['nullable', 'array'],
            'widgets_sequence.*' => ['string'],
            'widgets_slots' => ['nullable', 'array'],
            'widgets_slots.*' => ['string'],
        ]);

        $profile = $request->user()
            ->profile()
            ->firstOrCreate();

        $profile->fill($data);
        $profile->save();

        return response()->json([
            'profile' => $profile,
        ]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'avatar_url' => ['nullable', 'string'],
        ]);

        $profile = $request->user()
            ->profile()
            ->firstOrCreate();

        $profile->update($data);

        return response()->json([
            'profile' => $profile,
        ]);
    }

    public function updateTheme(Request $request): JsonResponse
    {
        $data = $request->validate([
            'theme' => [
                'required',
                'string',
                Rule::in(['light', 'dark']),
            ],
        ]);

        $profile = $request->user()
            ->profile()
            ->firstOrFail();

        $profile->update($data);

        return response()->json([
            'profile' => $profile,
        ]);
    }

    public function updateWidgets(Request $request): JsonResponse
    {
        $data = $request->validate([
            'widgets_sequence' => ['nullable', 'array'],
            'widgets_sequence.*' => ['string'],
            'widgets_slots' => ['nullable', 'array'],
            'widgets_slots.*' => ['string'],
        ]);

        $profile = $request->user()
            ->profile()
            ->firstOrCreate();

        $profile->update($data);

        return response()->json([
            'profile' => $profile,
        ]);
    }
}
