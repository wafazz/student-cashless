<?php

use App\Http\Controllers\Api\OperatorApiController;
use App\Http\Controllers\Api\ParentApiController;
use Illuminate\Support\Facades\Route;

// ─── PUBLIC ───────────────────────────────────────
Route::post('/operator/login', [OperatorApiController::class, 'login']);
Route::post('/parent/login', [ParentApiController::class, 'login']);
Route::post('/parent/register', [ParentApiController::class, 'register']);

// Legacy — auto-detect role
Route::post('/login', [OperatorApiController::class, 'login']);

// ─── OPERATOR / CASHIER (protected) ──────────────
Route::prefix('operator')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [OperatorApiController::class, 'logout']);
    Route::get('/profile', [OperatorApiController::class, 'profile']);
    Route::get('/dashboard', [OperatorApiController::class, 'dashboard']);
    Route::post('/lookup', [OperatorApiController::class, 'lookup']);
    Route::post('/charge', [OperatorApiController::class, 'charge']);
    Route::get('/sales', [OperatorApiController::class, 'sales']);
    Route::get('/refunds', [OperatorApiController::class, 'refundList']);
    Route::post('/refunds', [OperatorApiController::class, 'refundStore']);
    Route::get('/menu', [OperatorApiController::class, 'menuIndex']);
    Route::post('/menu', [OperatorApiController::class, 'menuStore']);
    Route::put('/menu/{menuItem}', [OperatorApiController::class, 'menuUpdate']);
    Route::delete('/menu/{menuItem}', [OperatorApiController::class, 'menuDestroy']);
    Route::get('/staff', [OperatorApiController::class, 'staffIndex']);
    Route::post('/staff', [OperatorApiController::class, 'staffStore']);
    Route::put('/staff/{staff}', [OperatorApiController::class, 'staffUpdate']);
});

// ─── PARENT (protected) ──────────────────────────
Route::prefix('parent')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [ParentApiController::class, 'logout']);
    Route::get('/dashboard', [ParentApiController::class, 'dashboard']);

    // Children
    Route::get('/children', [ParentApiController::class, 'children']);
    Route::post('/children', [ParentApiController::class, 'childrenStore']);
    Route::put('/children/{student}', [ParentApiController::class, 'childrenUpdate']);
    Route::get('/schools', [ParentApiController::class, 'schools']);

    // Transactions
    Route::get('/transactions', [ParentApiController::class, 'transactions']);

    // Top Up
    Route::get('/topup', [ParentApiController::class, 'topupInfo']);
    Route::post('/topup', [ParentApiController::class, 'topupStore']);
    Route::get('/topup/history', [ParentApiController::class, 'topupHistory']);

    // Notifications
    Route::get('/notifications', [ParentApiController::class, 'notifications']);
    Route::post('/notifications/read', [ParentApiController::class, 'markNotificationsRead']);

    // General Wallet
    Route::get('/wallet', [ParentApiController::class, 'walletInfo']);
    Route::post('/wallet/topup', [ParentApiController::class, 'walletTopup']);
    Route::post('/wallet/transfer', [ParentApiController::class, 'walletTransfer']);

    // Profile
    Route::get('/profile', [ParentApiController::class, 'profile']);
    Route::put('/profile', [ParentApiController::class, 'profileUpdate']);
    Route::put('/profile/password', [ParentApiController::class, 'passwordUpdate']);
});

// ─── BACKWARD COMPAT (old operator routes without prefix) ─
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [OperatorApiController::class, 'logout']);
    Route::get('/profile', [OperatorApiController::class, 'profile']);
    Route::get('/dashboard', [OperatorApiController::class, 'dashboard']);
    Route::post('/lookup', [OperatorApiController::class, 'lookup']);
    Route::post('/charge', [OperatorApiController::class, 'charge']);
    Route::get('/sales', [OperatorApiController::class, 'sales']);
    Route::get('/refunds', [OperatorApiController::class, 'refundList']);
    Route::post('/refunds', [OperatorApiController::class, 'refundStore']);
    Route::get('/menu', [OperatorApiController::class, 'menuIndex']);
    Route::post('/menu', [OperatorApiController::class, 'menuStore']);
    Route::put('/menu/{menuItem}', [OperatorApiController::class, 'menuUpdate']);
    Route::delete('/menu/{menuItem}', [OperatorApiController::class, 'menuDestroy']);
    Route::get('/staff', [OperatorApiController::class, 'staffIndex']);
    Route::post('/staff', [OperatorApiController::class, 'staffStore']);
    Route::put('/staff/{staff}', [OperatorApiController::class, 'staffUpdate']);
});
