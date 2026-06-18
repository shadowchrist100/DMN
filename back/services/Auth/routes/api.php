<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\OrganizationProxyController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('login');

Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:3,1');

Route::get('/email/verify', [AuthController::class, 'verifyEmail'])->name('verification.verify.api');
Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])->middleware('throttle:3,1');

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::post('/refresh', [AuthController::class, 'refresh']);

Route::middleware(['auth:api', 'check.admin'])->group(function () {
    Route::post('/admin/create', [AdminController::class, 'createAdmin']);
});

Route::middleware(['auth:api', 'check.admin.medical'])->group(function () {
    Route::post('/users/{user}/verify', [AdminController::class, 'verifyUser']);
    Route::get('/admin/pending-users', [AdminController::class, 'listPendingUsers']);
    Route::get('/admin/pending-organizations', [AdminController::class, 'listPendingOrganizations']);
    Route::post('/admin/validate-organization/{organization}', [AdminController::class, 'validateOrganization']);
    Route::get('/admin/organizations', [AdminController::class, 'listOrganizations']);

    Route::get('/users/{user}/documents', [DocumentController::class, 'getUserDocuments']);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
});

Route::middleware(['auth:api', 'check.admin.orga'])->group(function () {
    Route::get('/organizations', [OrganizationProxyController::class, 'index']);
    Route::post('/organizations', [OrganizationProxyController::class, 'store']);
    Route::get('/organizations/{organization}', [OrganizationProxyController::class, 'show']);
    Route::put('/organizations/{organization}', [OrganizationProxyController::class, 'update']);
    Route::delete('/organizations/{organization}', [OrganizationProxyController::class, 'destroy']);
});
