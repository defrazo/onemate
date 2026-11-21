<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Session\DatabaseSessionHandler;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserSessionController extends Controller
{
    public function destroyOthers(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless($user && $user->role !== 'demo', 403);

        $session = $request->session();

        abort_unless(
            config('session.driver') === 'database'
                && $request->hasSession()
                && $session->isStarted()
                && $session->getHandler() instanceof DatabaseSessionHandler
                && Auth::guard('web')->id() === $user->getAuthIdentifier(),
            409,
            'Управление сеансами недоступно',
        );

        $table = config('session.table');

        abort_unless(
            is_string($table) && $table !== '',
            503,
            'Управление сеансами недоступно',
        );

        $currentId = $session->getId();

        $sessions = DB::connection(config('session.connection'))
            ->table($table)
            ->where('user_id', $user->getAuthIdentifier());

        abort_unless(
            $currentId !== '' && (clone $sessions)->where('id', $currentId)->exists(),
            409,
            'Текущая сессия недоступна',
        );

        $sessions
            ->where('id', '<>', $currentId)
            ->delete();

        return response()->json([
            'code' => 'OTHER_SESSIONS_ENDED',
        ]);
    }
}
