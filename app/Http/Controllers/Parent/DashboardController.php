<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $students = $user->students()->with('school')->get();

        $totalBalance = $students->sum('wallet_balance');

        $recentTransactions = Transaction::whereIn('student_id', $students->pluck('id'))
            ->with('student', 'canteen')
            ->latest('created_at')
            ->take(10)
            ->get();

        $todaySpent = $students->sum('daily_spent_canteen') + $students->sum('daily_spent_koperasi');

        return Inertia::render('parent/Dashboard', [
            'students' => $students,
            'totalBalance' => $totalBalance,
            'todaySpent' => $todaySpent,
            'walletBalance' => (float) $user->wallet_balance,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
