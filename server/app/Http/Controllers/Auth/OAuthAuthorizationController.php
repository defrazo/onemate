<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Passport\Bridge\Client;
use Laravel\Passport\Bridge\Scope;
use Laravel\Passport\Bridge\User;
use Laravel\Passport\ClientRepository;
use Laravel\Passport\Passport;
use League\OAuth2\Server\RequestTypes\AuthorizationRequest;

class OAuthAuthorizationController extends Controller
{
    public function show(Request $request, ClientRepository $clients): JsonResponse
    {
        $authRequest = $request->session()->get('authRequest');
        $authToken = $request->session()->get('authToken');

        if (!is_string($authRequest) || !is_string($authToken)) {
            return response()->json([
                'code' => 'OAUTH_REQUEST_EXPIRED',
            ], 404);
        }

        try {
            $authorization = unserialize($authRequest, [
                'allowed_classes' => [
                    AuthorizationRequest::class,
                    Client::class,
                    Scope::class,
                    User::class,
                ],
            ]);
        } catch (\Throwable) {
            return response()->json([
                'code' => 'OAUTH_REQUEST_INVALID',
            ], 400);
        }

        if (!$authorization instanceof AuthorizationRequest) {
            return response()->json([
                'code' => 'OAUTH_REQUEST_INVALID',
            ], 400);
        }

        $user = $request->user('web');

        if (
            !$user ||
            (string) $authorization->getUser()?->getIdentifier() !==
            (string) $user->getAuthIdentifier()
        ) {
            return response()->json([
                'code' => 'OAUTH_SESSION_MISMATCH',
            ], 403);
        }

        $client = $clients->find(
            $authorization->getClient()->getIdentifier(),
        );

        if (!$client) {
            return response()->json([
                'code' => 'OAUTH_CLIENT_NOT_FOUND',
            ], 404);
        }

        return response()->json([
            'client' => [
                'name' => $client->name,
            ],
            'scopes' => collect($authorization->getScopes())
                ->map(function (Scope $scope) {
                    $id = $scope->getIdentifier();

                    return [
                        'id' => $id,
                        'description' => collect(Passport::scopesFor([$id]))
                            ->first()?->description ?? $id,
                    ];
                })
                ->values(),
            'authToken' => $authToken,
            'csrfToken' => $request->session()->token(),
        ]);
    }

    public function returnUrl(Request $request): JsonResponse
    {
        $url = $request->session()->pull('oauth_return_url');

        return response()->json([
            'url' => is_string($url) ? $url : null,
        ]);
    }
}
