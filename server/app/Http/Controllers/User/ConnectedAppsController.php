<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\Integrations\ToolBoxService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ConnectedAppsController extends Controller
{
    public function index(Request $request, ToolBoxService $toolBox): JsonResponse
    {
        $account = $toolBox->getConnectedAccount($request->user()->id);

        $apps = [];

        if ($account['connected'] ?? false) {
            $apps[] = [
                'id' => 'toolbox',
                'name' => 'ToolBox',
                'description' => 'Доступ к основным данным профиля',
                'account_type' => $account['account_type'],
            ];
        }

        return response()->json([
            'apps' => $apps,
        ]);
    }

    public function destroy(Request $request, ToolBoxService $toolBox): JsonResponse
    {
        $validated = $request->validate([
            'expected_account_type' => ['required', Rule::in(['cloud', 'local'])],
        ]);

        $clientId = config('services.toolbox.client_id');

        if (!$clientId || !DB::table('oauth_clients')->where('id', $clientId)->exists()) {
            return response()->json([
                'message' => 'OAuth-клиент ToolBox не настроен',
            ], 500);
        }

        $userId = $request->user()->id;

        $result = $toolBox->disconnectAccount(
            $userId,
            $validated['expected_account_type'],
        );

        if (!($result['disconnected'] ?? false)) {
            return response()->json([
                'message' => 'Не удалось отключить приложение',
            ], 502);
        }

        DB::transaction(function () use ($userId, $clientId) {
            $tokenIds = DB::table('oauth_access_tokens')
                ->where('user_id', $userId)
                ->where('client_id', $clientId)
                ->pluck('id');

            DB::table('oauth_access_tokens')
                ->whereIn('id', $tokenIds)
                ->update(['revoked' => true]);

            DB::table('oauth_refresh_tokens')
                ->whereIn('access_token_id', $tokenIds)
                ->update(['revoked' => true]);
        });

        return response()->json([
            'disconnected' => true,
            'deleted' => $result['deleted'] ?? false,
        ]);
    }
}
