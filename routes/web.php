<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Parent\DashboardController as ParentDashboard;
use App\Http\Controllers\Parent\ChildrenController;
use App\Http\Controllers\Parent\TopupController;
use App\Http\Controllers\Parent\TransactionController as ParentTransactions;
use App\Http\Controllers\Parent\NotificationController;
use App\Http\Controllers\Parent\ProfileController;
use App\Http\Controllers\Operator\DashboardController as OperatorDashboard;
use App\Http\Controllers\Operator\ScanController;
use App\Http\Controllers\Operator\SalesController;
use App\Http\Controllers\Operator\MenuController;
use App\Http\Controllers\Operator\RefundController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\SchoolController;
use App\Http\Controllers\Admin\OperatorController;
use App\Http\Controllers\Admin\ParentController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactions;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\SchoolRegistrationController;
use App\Http\Controllers\Payment\PaymentController;
use Inertia\Inertia;

// Landing Page
Route::get('/', function () {
    if (auth()->check()) {
        return match (auth()->user()->role) {
            'admin' => redirect('/admin/dashboard'),
            'parent' => redirect('/parent/dashboard'),
            'operator', 'cashier' => redirect('/operator/dashboard'),
            'school' => redirect('/school/dashboard'),
        };
    }
    return Inertia::render('Landing');
});

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
    Route::get('/register', [RegisterController::class, 'showRegister'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);
});

Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth')->name('logout');

// School Registration (public)
Route::get('/school-register', [SchoolRegistrationController::class, 'create'])->name('school.register');
Route::post('/school-register', [SchoolRegistrationController::class, 'store'])->name('school.register.store');

// Parent Routes
Route::prefix('parent')->middleware(['auth', 'role:parent'])->group(function () {
    Route::get('/dashboard', [ParentDashboard::class, 'index'])->name('parent.dashboard');
    Route::get('/children', [ChildrenController::class, 'index'])->name('parent.children');
    Route::post('/children', [ChildrenController::class, 'store'])->name('parent.children.store');
    Route::put('/children/{student}', [ChildrenController::class, 'update'])->name('parent.children.update');
    Route::get('/children/{student}/qr', [ChildrenController::class, 'qr'])->name('parent.children.qr');
    Route::get('/children/{student}/transactions', [ChildrenController::class, 'transactions'])->name('parent.children.transactions');
    Route::get('/topup', [TopupController::class, 'index'])->name('parent.topup');
    Route::post('/topup', [TopupController::class, 'store'])->name('parent.topup.store');
    Route::get('/topup/history', [TopupController::class, 'history'])->name('parent.topup.history');
    Route::get('/wallet', [\App\Http\Controllers\Parent\WalletController::class, 'index'])->name('parent.wallet');
    Route::get('/wallet/topup', [\App\Http\Controllers\Parent\WalletController::class, 'topup'])->name('parent.wallet.topup');
    Route::post('/wallet/topup', [\App\Http\Controllers\Parent\WalletController::class, 'topupStore'])->name('parent.wallet.topup.store');
    Route::post('/wallet/transfer', [\App\Http\Controllers\Parent\WalletController::class, 'transfer'])->name('parent.wallet.transfer');
    Route::get('/wallet/qr', [\App\Http\Controllers\Parent\WalletController::class, 'qr'])->name('parent.wallet.qr');
    Route::get('/transactions', [ParentTransactions::class, 'index'])->name('parent.transactions');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('parent.notifications');
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead'])->name('parent.notifications.markRead');
    Route::get('/profile', [ProfileController::class, 'index'])->name('parent.profile');
    Route::put('/profile', [ProfileController::class, 'update'])->name('parent.profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('parent.profile.password');
    Route::get('/pibg-fees', [\App\Http\Controllers\Parent\PibgFeeController::class, 'index'])->name('parent.pibg-fees');
    Route::post('/pibg-fees/{pibgFeeParent}/pay', [\App\Http\Controllers\Parent\PibgFeeController::class, 'pay'])->name('parent.pibg-fees.pay');
    Route::get('/school-fees', [\App\Http\Controllers\Parent\SchoolFeeController::class, 'index'])->name('parent.school-fees');
    Route::post('/school-fees/{schoolFeeStudent}/pay', [\App\Http\Controllers\Parent\SchoolFeeController::class, 'pay'])->name('parent.school-fees.pay');
    Route::get('/receipt/{transaction}', function (\App\Models\Transaction $transaction) {
        $studentIds = auth()->user()->students()->pluck('id');
        if (!$studentIds->contains($transaction->student_id)) {
            abort(403);
        }
        $pdf = $transaction->type === 'topup'
            ? \App\Services\ReceiptService::generateTopupReceipt($transaction)
            : \App\Services\ReceiptService::generatePurchaseReceipt($transaction);
        return $pdf->download('receipt-' . $transaction->id . '.pdf');
    })->name('parent.receipt');
});

// Operator Routes — shared by operator & cashier (with subscription check)
Route::prefix('operator')->middleware(['auth', 'role:operator,cashier', 'subscription'])->group(function () {
    Route::get('/dashboard', [OperatorDashboard::class, 'index'])->name('operator.dashboard');
    Route::get('/scan', [ScanController::class, 'index'])->name('operator.scan');
    Route::post('/lookup', [ScanController::class, 'lookup'])->name('operator.lookup');
    Route::post('/charge', [ScanController::class, 'charge'])->name('operator.charge');
    Route::get('/sales', [SalesController::class, 'index'])->name('operator.sales');
    Route::get('/refund', [RefundController::class, 'index'])->name('operator.refund');
    Route::post('/refund', [RefundController::class, 'store'])->name('operator.refund.store');
});

// Operator-only routes (menu, staff management)
Route::prefix('operator')->middleware(['auth', 'role:operator', 'subscription'])->group(function () {
    Route::get('/menu', [MenuController::class, 'index'])->name('operator.menu');
    Route::post('/menu', [MenuController::class, 'store'])->name('operator.menu.store');
    Route::put('/menu/{menuItem}', [MenuController::class, 'update'])->name('operator.menu.update');
    Route::delete('/menu/{menuItem}', [MenuController::class, 'destroy'])->name('operator.menu.destroy');
    Route::get('/staff', [\App\Http\Controllers\Operator\StaffController::class, 'index'])->name('operator.staff');
    Route::post('/staff', [\App\Http\Controllers\Operator\StaffController::class, 'store'])->name('operator.staff.store');
    Route::put('/staff/{staff}', [\App\Http\Controllers\Operator\StaffController::class, 'update'])->name('operator.staff.update');
});

// School Routes (PIBG)
Route::prefix('school')->middleware(['auth', 'role:school'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\School\DashboardController::class, 'index'])->name('school.dashboard');
    Route::get('/pibg-fees', [\App\Http\Controllers\School\PibgFeeController::class, 'index'])->name('school.pibg-fees');
    Route::post('/pibg-fees', [\App\Http\Controllers\School\PibgFeeController::class, 'store'])->name('school.pibg-fees.store');
    Route::get('/pibg-fees/{pibgFee}', [\App\Http\Controllers\School\PibgFeeController::class, 'show'])->name('school.pibg-fees.show');
    Route::put('/pibg-fees/{pibgFee}', [\App\Http\Controllers\School\PibgFeeController::class, 'update'])->name('school.pibg-fees.update');
    Route::delete('/pibg-fees/{pibgFee}', [\App\Http\Controllers\School\PibgFeeController::class, 'destroy'])->name('school.pibg-fees.destroy');
    Route::post('/pibg-fees/{pibgFee}/reassign', [\App\Http\Controllers\School\PibgFeeController::class, 'reassign'])->name('school.pibg-fees.reassign');
    Route::get('/stores', [\App\Http\Controllers\School\StoreController::class, 'index'])->name('school.stores');
    Route::post('/stores', [\App\Http\Controllers\School\StoreController::class, 'store'])->name('school.stores.store');
    Route::put('/stores/{canteen}', [\App\Http\Controllers\School\StoreController::class, 'update'])->name('school.stores.update');
    Route::get('/classes', [\App\Http\Controllers\School\ClassController::class, 'index'])->name('school.classes');
    Route::post('/classes', [\App\Http\Controllers\School\ClassController::class, 'store'])->name('school.classes.store');
    Route::put('/classes/{schoolClass}', [\App\Http\Controllers\School\ClassController::class, 'update'])->name('school.classes.update');
    Route::delete('/classes/{schoolClass}', [\App\Http\Controllers\School\ClassController::class, 'destroy'])->name('school.classes.destroy');
    Route::get('/school-fees', [\App\Http\Controllers\School\SchoolFeeController::class, 'index'])->name('school.school-fees');
    Route::post('/school-fees', [\App\Http\Controllers\School\SchoolFeeController::class, 'store'])->name('school.school-fees.store');
    Route::get('/school-fees/{schoolFee}', [\App\Http\Controllers\School\SchoolFeeController::class, 'show'])->name('school.school-fees.show');
    Route::put('/school-fees/{schoolFee}', [\App\Http\Controllers\School\SchoolFeeController::class, 'update'])->name('school.school-fees.update');
    Route::delete('/school-fees/{schoolFee}', [\App\Http\Controllers\School\SchoolFeeController::class, 'destroy'])->name('school.school-fees.destroy');
    Route::get('/reports', [\App\Http\Controllers\School\ReportController::class, 'index'])->name('school.reports');
});

// Admin Routes
Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('admin.dashboard');
    Route::get('/schools', [SchoolController::class, 'index'])->name('admin.schools');
    Route::post('/schools', [SchoolController::class, 'store'])->name('admin.schools.store');
    Route::put('/schools/{school}', [SchoolController::class, 'update'])->name('admin.schools.update');
    Route::get('/operators', [OperatorController::class, 'index'])->name('admin.operators');
    Route::post('/operators', [OperatorController::class, 'store'])->name('admin.operators.store');
    Route::put('/operators/{operator}', [OperatorController::class, 'update'])->name('admin.operators.update');
    Route::get('/parents', [ParentController::class, 'index'])->name('admin.parents');
    Route::get('/transactions', [AdminTransactions::class, 'index'])->name('admin.transactions');
    Route::get('/reports', [ReportController::class, 'index'])->name('admin.reports');
    Route::get('/settings', [SettingController::class, 'index'])->name('admin.settings');
    Route::put('/settings', [SettingController::class, 'update'])->name('admin.settings.update');
    Route::get('/registrations', [SchoolRegistrationController::class, 'index'])->name('admin.registrations');
    Route::put('/registrations/{registration}', [SchoolRegistrationController::class, 'update'])->name('admin.registrations.update');
    Route::get('/invoices', [InvoiceController::class, 'index'])->name('admin.invoices');
    Route::put('/invoices/{invoice}', [InvoiceController::class, 'update'])->name('admin.invoices.update');
    Route::get('/pibg', [\App\Http\Controllers\Admin\PibgController::class, 'index'])->name('admin.pibg');
    Route::get('/school-users', [\App\Http\Controllers\Admin\PibgController::class, 'schoolUsers'])->name('admin.school-users');
    Route::post('/school-users', [\App\Http\Controllers\Admin\PibgController::class, 'storeSchoolUser'])->name('admin.school-users.store');
    Route::put('/school-users/{user}', [\App\Http\Controllers\Admin\PibgController::class, 'updateSchoolUser'])->name('admin.school-users.update');
});

// Payment Callbacks (CSRF exempt via bootstrap/app.php)
Route::post('/payment/bayarcash/callback', [PaymentController::class, 'bayarcashCallback'])->name('payment.bayarcash.callback');
Route::match(['get', 'post'], '/payment/bayarcash/return', [PaymentController::class, 'bayarcashReturn'])
    ->withoutMiddleware('web')
    ->name('payment.bayarcash.return');
Route::post('/payment/toyyibpay/callback', [PaymentController::class, 'toyyibpayCallback'])->name('payment.toyyibpay.callback');
Route::get('/payment/toyyibpay/return', [PaymentController::class, 'toyyibpayReturn'])->name('payment.toyyibpay.return');
