<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $canteen = $user->getCanteenForWork();

        if (!$canteen) {
            return Inertia::render('operator/Dashboard', [
                'canteen' => null,
                'todaySales' => 0,
                'todayTransactions' => 0,
                'recentTransactions' => [],
            ]);
        }

        $today = now()->toDateString();

        $todayTransactions = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', $today)
            ->get();

        $recentTransactions = Transaction::where('canteen_id', $canteen->id)
            ->with('student')
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(function ($tx) {
                if (!$tx->student && $tx->parent_id) {
                    $parent = User::find($tx->parent_id);
                    $tx->student = (object) [
                        'name' => $parent ? $parent->name . ' (Parent)' : 'Unknown',
                    ];
                }
                return $tx;
            });

        return Inertia::render('operator/Dashboard', [
            'canteen' => $canteen->load('school'),
            'todaySales' => $todayTransactions->sum('amount'),
            'todayTransactions' => $todayTransactions->count(),
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
