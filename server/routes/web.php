<?php

use App\Http\Controllers\Cloud\CloudFileController;
use App\Http\Middleware\EnsureAccountIsActive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Cloud
Route::middleware(['auth', EnsureAccountIsActive::class])
    ->prefix('cloud')
    ->name('cloud.')
    ->group(function () {
        Route::get('/csrf-token', function (Request $request) {
            return response()->json(['token' => $request->session()->token()]);
        });

        Route::get('/files/{id}/download', [CloudFileController::class, 'download'])
            ->name('files.download');

        Route::post('/files/archive', [CloudFileController::class, 'downloadArchive'])
            ->name('files.archive');
    });
