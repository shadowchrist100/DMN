<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:3,1');

Route::get('/email/verify', [AuthController::class, 'verifyEmail'])->name('verification.verify.api');
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->middleware('throttle:3,1');

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:api', 'check.status'])->group(function () {
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

Route::middleware('auth:api')->post('/users/{user}/verify', [AuthController::class, 'verify']);
