<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Canteen;
use App\Models\School;
use App\Models\Student;
use App\Models\Topup;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalSchools = School::where('status', 'active')->count();
        $totalStudents = Student::where('status', 'active')->count();
        $totalParents = User::where('role', 'parent')->where('status', 'active')->count();
        $totalOperators = User::where('role', 'operator')->where('status', 'active')->count();
        $totalCanteens = Canteen::where('type', 'canteen')->where('status', 'active')->count();
        $totalKoperasi = Canteen::where('type', 'koperasi')->where('status', 'active')->count();

        $today = now()->toDateString();
        $canteenIds = Canteen::where('type', 'canteen')->pluck('id');
        $koperasiIds = Canteen::where('type', 'koperasi')->pluck('id');

        $todaySales = Transaction::where('type', 'purchase')->whereDate('created_at', $today)->sum('amount');
        $todayCanteenSales = Transaction::where('type', 'purchase')->whereDate('created_at', $today)->whereIn('canteen_id', $canteenIds)->sum('amount');
        $todayKoperasiSales = Transaction::where('type', 'purchase')->whereDate('created_at', $today)->whereIn('canteen_id', $koperasiIds)->sum('amount');
        $todayTopups = Transaction::where('type', 'topup')->whereDate('created_at', $today)->sum('amount');
        $todayTransactions = Transaction::whereDate('created_at', $today)->count();

        $totalWalletBalance = Student::sum('wallet_balance');

        $totalServiceFees = Topup::where('status', 'success')->sum('service_fee');
        $todayServiceFees = Topup::where('status', 'success')->whereDate('created_at', $today)->sum('service_fee');
        $monthlySubscriptionRevenue = School::where('subscription_status', 'active')->sum('subscription_fee');

        // Monthly revenue for chart (last 6 months)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $sales = Transaction::where('type', 'purchase')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('amount');
            $topups = Transaction::where('type', 'topup')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('amount');
            $monthlyData[] = [
                'month' => $month->format('M Y'),
                'sales' => round($sales, 2),
                'topups' => round($topups, 2),
            ];
        }

        $recentTransactions = Transaction::with('student', 'canteen')
            ->latest('created_at')
            ->take(10)
            ->get();

        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'totalSchools' => $totalSchools,
                'totalStudents' => $totalStudents,
                'totalParents' => $totalParents,
                'totalOperators' => $totalOperators,
                'totalCanteens' => $totalCanteens,
                'totalKoperasi' => $totalKoperasi,
                'todaySales' => $todaySales,
                'todayCanteenSales' => $todayCanteenSales,
                'todayKoperasiSales' => $todayKoperasiSales,
                'todayTopups' => $todayTopups,
                'todayTransactions' => $todayTransactions,
                'totalWalletBalance' => $totalWalletBalance,
                'totalServiceFees' => $totalServiceFees,
                'todayServiceFees' => $todayServiceFees,
                'monthlySubscriptionRevenue' => $monthlySubscriptionRevenue,
            ],
            'monthlyData' => $monthlyData,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
