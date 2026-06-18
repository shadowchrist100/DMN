<?php

use App\Exceptions\MedicalServiceException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'check.status' => \App\Http\Middleware\CheckAccountStatus::class,
            'check.admin' => \App\Http\Middleware\CheckAdminRole::class,
            'check.admin.orga' => \App\Http\Middleware\CheckAdminOrganisation::class,
            'check.admin.medical' => \App\Http\Middleware\CheckAdminMedical::class,
        ]);

        $middleware->redirectGuestsTo(fn (\Illuminate\Http\Request $request) =>
            $request->is('api/*') ? null : route('login')
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (MedicalServiceException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 503);
        });
    })->create();
