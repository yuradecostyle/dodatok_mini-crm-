<?php

use App\Http\Controllers\ApiController;
use App\Http\Controllers\AppController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PushController;
use Illuminate\Support\Facades\Route;

Route::get('/login', [AuthController::class, 'show'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Кнопки в сповіщеннях: захищені підписом посилання
Route::middleware(['signed', 'throttle:30,1'])->group(function () {
    Route::get('/a/tasks/{task}/done', [PushController::class, 'taskDone'])->name('push.task.done');
    Route::get('/a/tasks/{task}/snooze/{minutes}', [PushController::class, 'taskSnooze'])->name('push.task.snooze')->whereNumber('minutes');
});

Route::middleware('auth')->group(function () {
    Route::get('/', [AppController::class, 'index']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('api')->group(function () {
        Route::get('/state', [ApiController::class, 'state']);
        Route::get('/export', [ApiController::class, 'export']);
        Route::post('/tasks/bulk', [ApiController::class, 'bulkTasks']);
        Route::post('/account/password', [AuthController::class, 'password']);

        Route::get('/push/key', [PushController::class, 'key']);
        Route::post('/push/subscribe', [PushController::class, 'subscribe']);
        Route::post('/push/unsubscribe', [PushController::class, 'unsubscribe']);
        Route::post('/push/test', [PushController::class, 'test']);

        $res = 'leads|projects|tasks|settlements|utilities|transactions';
        Route::post('/{resource}', [ApiController::class, 'store'])->where('resource', $res);
        Route::put('/{resource}/{id}', [ApiController::class, 'update'])->where('resource', $res)->whereNumber('id');
        Route::delete('/{resource}/{id}', [ApiController::class, 'destroy'])->where('resource', $res)->whereNumber('id');
    });
});
