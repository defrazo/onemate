<?php

namespace App\Http\Controllers\User;

use App\Enums\UserLocationType;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    private function resolveType(string $type): UserLocationType
    {
        $locationType = UserLocationType::tryFrom($type);

        abort_if(!$locationType, 404);

        return $locationType;
    }
}
