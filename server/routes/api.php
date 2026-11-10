<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\OAuthAuthorizationController;
use App\Http\Controllers\Auth\OAuthUserController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Cloud\CloudController;
use App\Http\Controllers\Cloud\CloudFileController;
use App\Http\Controllers\Cloud\CloudShareController;
use App\Http\Controllers\Kanban\KanbanBoardColumnController;
use App\Http\Controllers\Kanban\KanbanBoardController;
use App\Http\Controllers\Kanban\KanbanBoardTaskController;
use App\Http\Controllers\Monitoring\MonitoringController;
use App\Http\Controllers\Network\MonitoredServiceController;
use App\Http\Controllers\Network\PortCheckController;
use App\Http\Controllers\Network\ServiceCheckController;
use App\Http\Controllers\Network\SslCheckController;
use App\Http\Controllers\Notification\NotificationController;
use App\Http\Controllers\Todo\TodoController;
use App\Http\Controllers\User\ConnectedAppsController;
use App\Http\Controllers\User\UserAccountController;
use App\Http\Controllers\User\UserAuthLogController;
use App\Http\Controllers\User\UserLocationController;
use App\Http\Controllers\User\UserNoteController;
use App\Http\Controllers\User\UserProfileController;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureNotDemo;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/invite/verify', [AuthController::class, 'verifyInvite'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::get('/auth/session', [AuthController::class, 'session'])->middleware('throttle:60,1');

Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::get('/oauth/user', OAuthUserController::class)
    ->middleware(['auth:api', 'scopes:profile:read']);

// Password
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:5,1');

// Email verification
Route::post('/email/verify/resend', [EmailVerificationController::class, 'resendVerification'])
    ->middleware('throttle:3,1');
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verifyEmail'])
    ->middleware(['signed:relative', 'throttle:6,1'])
    ->name('verification.verify');
Route::get('/user/email/verify/{id}/{hash}', [UserAccountController::class, 'verifyPendingEmail'])
    ->middleware('signed:relative')
    ->name('pending-email.verify');

// Network
Route::prefix('network')->group(function () {
    Route::post('/service/check', ServiceCheckController::class);
    Route::post('/port/check', PortCheckController::class);
    Route::post('/ssl/check', SslCheckController::class);
});

// Cloud
Route::prefix('cloud')->middleware('throttle:60,1')->group(function () {
    Route::get('/short/{code}', [CloudShareController::class, 'redirect'])
        ->where('code', 'f[a-f0-9]{15}');
    Route::prefix('shared')->group(function () {
        Route::get('/{token}', [CloudShareController::class, 'show']);
        Route::get('/{token}/preview', [CloudShareController::class, 'preview']);
        Route::get('/{token}/download', [CloudShareController::class, 'download']);
    });
});

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);

    // OAuth
    Route::get('/oauth/authorization', [OAuthAuthorizationController::class, 'show'])
        ->middleware([EnsureAccountIsActive::class, EnsureNotDemo::class]);
    Route::get('/oauth/return-url', [OAuthAuthorizationController::class, 'returnUrl']);

    Route::post('/user/restore', [UserAccountController::class, 'restore'])->middleware('throttle:5,1');

    // Active accounts
    Route::middleware(EnsureAccountIsActive::class)->group(function () {
        Route::get('/monitoring', MonitoringController::class)->middleware(EnsureAdmin::class);

        // User
        Route::prefix('user')->group(function () {
            Route::patch('/username', [UserAccountController::class, 'updateUsername'])->middleware('throttle:5,1');
            Route::patch('/email', [UserAccountController::class, 'updateEmail'])->middleware('throttle:5,1');
            Route::delete('/email/pending', [UserAccountController::class, 'cancelPendingEmail']);
            Route::post('/email/resend', [UserAccountController::class, 'resendPendingEmail'])->middleware('throttle:3,1');
            Route::patch('/password', [UserAccountController::class, 'updatePassword'])->middleware('throttle:5,1');
            Route::delete('/', [UserAccountController::class, 'destroy'])->middleware('throttle:3,1');

            // Connected apps
            Route::get('/connected-apps', [ConnectedAppsController::class, 'index']);
            Route::delete('/connected-apps/toolbox', [ConnectedAppsController::class, 'destroy'])->middleware('throttle:5,1');

            // Profile
            Route::get('/profile', [UserProfileController::class, 'show']);
            Route::patch('/profile', [UserProfileController::class, 'update']);
            Route::patch('/profile/avatar', [UserProfileController::class, 'updateAvatar']);
            Route::patch('/profile/theme', [UserProfileController::class, 'updateTheme']);
            Route::patch('/profile/widgets', [UserProfileController::class, 'updateWidgets']);

            // Locations
            Route::get('/location/detect', [UserLocationController::class, 'detect']);
            Route::get('/locations/{type}', [UserLocationController::class, 'show']);
            Route::put('/locations/{type}', [UserLocationController::class, 'update']);
            Route::delete('/locations/{type}', [UserLocationController::class, 'destroy']);

            // Activity
            Route::get('/activity', [UserAuthLogController::class, 'index']);
            Route::post('/activity', [UserAuthLogController::class, 'store'])->middleware('throttle:10,1');
            Route::delete('/activity', [UserAuthLogController::class, 'destroy']);

            // Notes
            Route::get('/notes', [UserNoteController::class, 'index']);
            Route::put('/notes', [UserNoteController::class, 'replace']);
        });

        // ToDo
        Route::prefix('todo')->group(function () {
            Route::get('/canvases', [TodoController::class, 'index']);
            Route::post('/canvases', [TodoController::class, 'storeCanvas']);
            Route::patch('/canvases/{canvas}', [TodoController::class, 'updateCanvas']);
            Route::delete('/canvases/{canvas}', [TodoController::class, 'destroyCanvas']);

            Route::post('/canvases/{canvas}/lists', [TodoController::class, 'storeList']);
            Route::patch('/lists/{list}', [TodoController::class, 'updateList']);
            Route::delete('/lists/{list}', [TodoController::class, 'destroyList']);
            Route::patch('/lists/{list}/slot', [TodoController::class, 'moveList']);
            Route::patch('/lists/{list}/items/order', [TodoController::class, 'reorderItems']);

            Route::post('/lists/{list}/items', [TodoController::class, 'storeItem']);
            Route::patch('/items/{item}', [TodoController::class, 'updateItem']);
            Route::delete('/items/{item}', [TodoController::class, 'destroyItem']);
            Route::patch('/items/{item}/position', [TodoController::class, 'moveItem']);
        });

        // Kanban
        Route::prefix('kanban/boards')->group(function () {
            Route::post('/initialize', [KanbanBoardController::class, 'initialize']);
            Route::get('/', [KanbanBoardController::class, 'index']);
            Route::post('/', [KanbanBoardController::class, 'store']);
            Route::get('/{board}', [KanbanBoardController::class, 'show'])->whereUuid('board');
            Route::patch('/{board}', [KanbanBoardController::class, 'update'])->whereUuid('board');
            Route::delete('/{board}', [KanbanBoardController::class, 'destroy'])->whereUuid('board');

            Route::post('/{board}/columns', [KanbanBoardColumnController::class, 'store'])->whereUuid('board');
            Route::patch('/{board}/columns/order', [KanbanBoardColumnController::class, 'reorder'])->whereUuid('board');
            Route::patch('/{board}/columns/{column}', [KanbanBoardColumnController::class, 'update'])->whereUuid(['board', 'column']);
            Route::delete('/{board}/columns/{column}', [KanbanBoardColumnController::class, 'destroy'])->whereUuid(['board', 'column']);

            Route::post('/{board}/tasks', [KanbanBoardTaskController::class, 'store'])->whereUuid('board');
            Route::patch('/{board}/tasks/{task}', [KanbanBoardTaskController::class, 'update'])->whereUuid(['board', 'task']);
            Route::delete('/{board}/tasks/{task}', [KanbanBoardTaskController::class, 'destroy'])->whereUuid(['board', 'task']);
            Route::patch('/{board}/tasks/{task}/move', [KanbanBoardTaskController::class, 'move'])->whereUuid(['board', 'task']);
        });

        // Network
        Route::prefix('network/services')->group(function () {
            Route::get('/', [MonitoredServiceController::class, 'index']);
            Route::post('/', [MonitoredServiceController::class, 'store']);
            Route::patch('/order', [MonitoredServiceController::class, 'reorder']);
            Route::patch('/{service}', [MonitoredServiceController::class, 'update']);
            Route::delete('/{service}', [MonitoredServiceController::class, 'destroy']);
            Route::post('/{service}/check', [MonitoredServiceController::class, 'check']);
            Route::get('/{service}/history', [MonitoredServiceController::class, 'history']);
        });

        // Cloud
        Route::prefix('cloud')->group(function () {
            Route::get('/', [CloudController::class, 'index']);
            Route::get('/text', [CloudController::class, 'getText']);
            Route::put('/text', [CloudController::class, 'saveText']);

            Route::post('/files', [CloudFileController::class, 'store']);
            Route::delete('/files', [CloudFileController::class, 'destroyMany']);
            Route::get('/files/{id}/download', [CloudFileController::class, 'download']);
            Route::patch('/files/{id}', [CloudFileController::class, 'update']);
            Route::delete('/files/{id}', [CloudFileController::class, 'destroy']);

            Route::post('/files/{id}/share', [CloudShareController::class, 'store']);
            Route::delete('/files/{id}/share', [CloudShareController::class, 'destroy']);
        });

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::patch('/read-all', [NotificationController::class, 'readAll']);
            Route::patch('/{notification}/read', [NotificationController::class, 'read']);
            Route::delete('/', [NotificationController::class, 'destroyAll']);
            Route::delete('/{notification}', [NotificationController::class, 'destroy']);
        });
    });
});
