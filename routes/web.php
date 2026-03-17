<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Parent\DashboardController as ParentDashboard;
use App\Http\Controllers\Parent\ChildrenController;
use App\Http\Controllers\Operator\DashboardController as OperatorDashboard;
use App\Http\Controllers\Operator\ScanController;

// Landing
Route::get('/', function () {
    if (auth()->check()) {
        return match (auth()->user()->role) {
            'admin' => redirect('/admin/dashboard'),
            'parent' => redirect('/parent/dashboard'),
            'operator' => redirect('/operator/dashboard'),
        };
    }
    return redirect('/login');
});

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
    Route::get('/register', [RegisterController::class, 'showRegister'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);
});

Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// Parent Routes
Route::prefix('parent')->middleware(['auth', 'role:parent'])->group(function () {
    Route::get('/dashboard', [ParentDashboard::class, 'index'])->name('parent.dashboard');
    Route::get('/children', [ChildrenController::class, 'index'])->name('parent.children');
    Route::post('/children', [ChildrenController::class, 'store'])->name('parent.children.store');
    Route::put('/children/{student}', [ChildrenController::class, 'update'])->name('parent.children.update');
    Route::get('/children/{student}/qr', [ChildrenController::class, 'qr'])->name('parent.children.qr');
    Route::get('/children/{student}/transactions', [ChildrenController::class, 'transactions'])->name('parent.children.transactions');
});

// Operator Routes
Route::prefix('operator')->middleware(['auth', 'role:operator'])->group(function () {
    Route::get('/dashboard', [OperatorDashboard::class, 'index'])->name('operator.dashboard');
    Route::get('/scan', [ScanController::class, 'index'])->name('operator.scan');
    Route::post('/lookup', [ScanController::class, 'lookup'])->name('operator.lookup');
    Route::post('/charge', [ScanController::class, 'charge'])->name('operator.charge');
});

// Admin Routes (placeholder)
Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', function () {
        return \Inertia\Inertia::render('admin/Dashboard');
    })->name('admin.dashboard');
});
