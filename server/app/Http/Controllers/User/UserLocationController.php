<?php

namespace App\Http\Controllers\User;

use App\Enums\UserLocationType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class UserLocationController extends Controller
{
    public function show(Request $request, string $type): JsonResponse
    {
        $locationType = $this->resolveType($type);

        $location = $request->user()
            ->locations()
            ->where('type', $locationType->value)
            ->first();

        return response()->json([
            'location' => $location,
        ]);
    }

    public function update(Request $request, string $type): JsonResponse
    {
        $locationType = $this->resolveType($type);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lon' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $location = $request->user()
            ->locations()
            ->updateOrCreate(
                [
                    'type' => $locationType->value,
                ],
                $data,
            );

        return response()->json([
            'location' => $location,
        ]);
    }

    public function destroy(Request $request, string $type): JsonResponse
    {
        $locationType = $this->resolveType($type);

        $request->user()
            ->locations()
            ->where('type', $locationType->value)
            ->delete();

        return response()->json([
            'code' => 'LOCATION_DELETED',
        ]);
    }

    public function detect(Request $request): JsonResponse
    {
        $ip = $request->ip();

        $emptyResponse = fn () => response()->json([
            'ip' => $ip,
            'location' => null,
        ]);

        $isLocal = in_array($ip, ['127.0.0.1', '::1'], true);

        $url = $isLocal
            ? 'https://ipinfo.io/json'
            : "https://ipinfo.io/{$ip}/json";

        try {
            $response = Http::connectTimeout(2)
                ->timeout(3)
                ->get($url, [
                    'token' => config('services.ipinfo.token'),
                ]);

            if ($response->failed()) {
                return $emptyResponse();
            }
        } catch (ConnectionException $e) {
            return $emptyResponse();
        }

        $data = $response->json();

        if (empty($data['loc']) || empty($data['city'])) {
            return $emptyResponse();
        }

        $coordinates = explode(',', $data['loc']);

        if (count($coordinates) !== 2) {
            return $emptyResponse();
        }

        [$lat, $lon] = array_map('floatval', $coordinates);

        $geo = [];

        try {
            $geoResponse = Http::connectTimeout(2)
                ->timeout(3)
                ->withHeaders([
                    'User-Agent' => 'OneMate/1.0 (https://onemate.letunoff.ru)',
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'lat' => $lat,
                    'lon' => $lon,
                    'format' => 'json',
                    'accept-language' => 'ru',
                ]);

            if ($geoResponse->successful()) {
                $geo = $geoResponse->json();
            }
        } catch (ConnectionException $e) {

        }

        $address = $geo['address'] ?? [];

        $name = $address['hamlet']
            ?? $address['village']
            ?? $address['town']
            ?? $address['city']
            ?? $address['locality']
            ?? $data['city'];

        $region = $address['state']
            ?? $address['region']
            ?? $data['region']
            ?? '';

        $country = $address['country_code'] ?? $data['country'] ?? '';

        return response()->json([
            'ip' => $data['ip'] ?? $ip,
            'location' => [
                'name' => $name,
                'region' => $region,
                'country' => strtoupper($country),
                'lat' => $lat,
                'lon' => $lon,
            ],
        ]);
    }

    private function resolveType(string $type): UserLocationType
    {
        $locationType = UserLocationType::tryFrom($type);

        abort_if(!$locationType, 404);

        return $locationType;
    }
}
