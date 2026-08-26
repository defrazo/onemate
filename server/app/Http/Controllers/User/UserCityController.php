<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserCityController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $city = $request->user()->city;

        if (!$city) {
            return response()->json([
                'city' => [
                    'name' => 'Москва',
                    'region' => 'Центральный',
                    'country' => 'Russia',
                    'lat' => 55.7558,
                    'lon' => 37.6173,
                ],
            ]);
        }

        return response()->json([
            'city' => $city,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lon' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $city = $request->user()
            ->city()
            ->updateOrCreate(
                [],
                $data,
            );

        return response()->json([
            'city' => $city,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $city = $request->user()->city;

        if ($city) {
            $city->delete();
        }

        return response()->json([
            'code' => 'CITY_DELETED',
        ]);
    }
}
