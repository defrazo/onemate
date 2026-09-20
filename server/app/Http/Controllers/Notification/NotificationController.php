<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class NotificationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->limit(20)
            ->get();

        return NotificationResource::collection($notifications);
    }

    public function read(Request $request, string $notification): NotificationResource
    {
        $item = $request->user()
            ->notifications()
            ->findOrFail($notification);

        $item->markAsRead();

        return new NotificationResource($item);
    }

    public function readAll(Request $request): Response
    {
        $request->user()
            ->unreadNotifications()
            ->update([
                'read_at' => now(),
            ]);

        return response()->noContent();
    }

    public function destroy(Request $request, string $notification): Response
    {
        $item = $request->user()
            ->notifications()
            ->findOrFail($notification);

        $item->delete();

        return response()->noContent();
    }

    public function destroyAll(Request $request): Response
    {
        $request->user()
            ->notifications()
            ->delete();

        return response()->noContent();
    }
}
