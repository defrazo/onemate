<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Kanban\KanbanColumnController;
use App\Http\Controllers\Kanban\KanbanTaskController;
use App\Http\Controllers\User\UserAccountController;
use App\Http\Controllers\User\UserAuthLogController;
use App\Http\Controllers\User\UserCityController;
use App\Http\Controllers\User\UserNoteController;
use App\Http\Controllers\User\UserProfileController;
use App\Http\Middleware\EnsureAccountIsActive;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/invite/verify', [AuthController::class, 'verifyInvite'])
    ->middleware('throttle:5,1');

Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:5,1');

Route::middleware('web')->group(function () {
    Route::get('/auth/session', [AuthController::class, 'session'])
        ->middleware('throttle:60,1');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:10,1');

    Route::post('/logout', [AuthController::class, 'logout']);
});

// Password
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])
    ->middleware('throttle:5,1');

Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
    ->middleware('throttle:5,1');

// Email verification
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verifyEmail'])
    ->middleware(['signed:relative', 'throttle:6,1'])
    ->name('verification.verify');

Route::get('/user/email/verify/{id}/{hash}', [UserAccountController::class, 'verifyPendingEmail'])
    ->middleware('signed:relative')
    ->name('pending-email.verify');

// Authenticated all
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);

    Route::post('/user/restore', [UserAccountController::class, 'restore'])
        ->middleware('throttle:3,1');

    // Active only (not deleted)
    Route::middleware(EnsureAccountIsActive::class)->group(function () {
        // Account
        Route::patch('/user/email', [UserAccountController::class, 'updateEmail'])
            ->middleware('throttle:5,1');

        Route::post('/email/resend', [EmailVerificationController::class, 'resendVerification'])
            ->middleware('throttle:3,1');

        Route::delete('/user/email/pending', [UserAccountController::class, 'cancelPendingEmail']);

        Route::post('/user/email/resend', [UserAccountController::class, 'resendPendingEmail'])
            ->middleware('throttle:3,1');

        Route::patch('/user/password', [UserAccountController::class, 'updatePassword'])
            ->middleware('throttle:5,1');

        Route::delete('/user', [UserAccountController::class, 'destroy'])
            ->middleware('throttle:3,1');

        // Profile
        Route::get('/user/profile', [UserProfileController::class, 'show']);
        Route::patch('/user/profile', [UserProfileController::class, 'update']);
        Route::patch('/user/profile/avatar', [UserProfileController::class, 'updateAvatar']);
        Route::patch('/user/profile/theme', [UserProfileController::class, 'updateTheme']);
        Route::patch('/user/profile/widgets', [UserProfileController::class, 'updateWidgets']);

        // Weather city
        Route::get('/user/city', [UserCityController::class, 'show']);
        Route::put('/user/city', [UserCityController::class, 'update']);
        Route::delete('/user/city', [UserCityController::class, 'destroy']);

        // Activity
        Route::get('/user/activity', [UserAuthLogController::class, 'index']);

        Route::post('/user/activity', [UserAuthLogController::class, 'store'])
            ->middleware('throttle:10,1');

        Route::delete('/user/activity', [UserAuthLogController::class, 'destroy']);

        // Notes
        Route::get('/user/notes', [UserNoteController::class, 'index']);
        Route::put('/user/notes', [UserNoteController::class, 'replace']);

        // Kanban columns
        Route::get('/kanban/columns', [KanbanColumnController::class, 'index']);
        Route::post('/kanban/columns', [KanbanColumnController::class, 'store']);
        Route::patch('/kanban/columns/{column}', [KanbanColumnController::class, 'update']);
        Route::patch('/kanban/columns/{column}/position', [KanbanColumnController::class, 'move']);
        Route::delete('/kanban/columns/{column}', [KanbanColumnController::class, 'destroy']);

        // Kanban tasks
        Route::get('/kanban/tasks', [KanbanTaskController::class, 'index']);
        Route::post('/kanban/tasks', [KanbanTaskController::class, 'store']);
        Route::patch('/kanban/tasks/{task}', [KanbanTaskController::class, 'update']);
        Route::patch('/kanban/tasks/{task}/position', [KanbanTaskController::class, 'move']);
        Route::delete('/kanban/tasks/{task}', [KanbanTaskController::class, 'destroy']);
    });
});
