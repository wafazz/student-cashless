<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function index(Request $request)
    {
        $canteen = auth()->user()->getCanteenForWork();

        if (!$canteen) {
            return Inertia::render('operator/Sales', [
                'canteen' => null,
                'transactions' => ['data' => [], 'links' => []],
                'summary' => ['total' => 0, 'count' => 0],
                'date' => now()->toDateString(),
            ]);
        }

        $date = $request->input('date', now()->toDateString());

        $query = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', $date)
            ->with('student')
            ->latest('created_at');

        $transactions = $query->paginate(30)->withQueryString();

        $dayTotals = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', $date);

        return Inertia::render('operator/Sales', [
            'canteen' => $canteen->load('school'),
            'transactions' => $transactions,
            'summary' => [
                'total' => $dayTotals->sum('amount'),
                'count' => $dayTotals->count(),
            ],
            'date' => $date,
        ]);
    }
}
