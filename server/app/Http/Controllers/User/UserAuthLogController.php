<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\UserAuthLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAuthLogController extends Controller
{
    private const MAX_LOGS = 10;

    public function index(Request $request): JsonResponse
    {
        $logs = $request->user()
            ->authLogs()
            ->latest('created_at')
            ->limit(self::MAX_LOGS)
            ->get();

        return response()->json([
            'logs' => $logs,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'ip_address' => ['required', 'string', 'max:45'],
            'city' => ['required', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'browser' => ['required', 'string', 'max:255'],
            'is_mobile' => ['required', 'boolean'],
        ]);

        $user = $request->user();

        $log = $user->authLogs()->create($data);

        $idsToDelete = $user->authLogs()
            ->latest('created_at')
            ->skip(self::MAX_LOGS)
            ->take(PHP_INT_MAX)
            ->pluck('id');

        if ($idsToDelete->isNotEmpty()) {
            UserAuthLog::query()
                ->whereIn('id', $idsToDelete)
                ->delete();
        }

        return response()->json([
            'log' => $log,
        ], 201);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()
            ->authLogs()
            ->delete();

        return response()->json([
            'code' => 'ACTIVITY_LOG_CLEARED',
        ]);
    }
}
