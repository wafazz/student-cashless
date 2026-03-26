<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with('student', 'canteen', 'operator');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('store_type')) {
            $query->whereHas('canteen', function ($q) use ($request) {
                $q->where('type', $request->store_type);
            });
        }

        $transactions = $query->latest('created_at')->paginate(30)->withQueryString();

        return Inertia::render('admin/Transactions', [
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'store_type', 'date_from', 'date_to', 'search']),
        ]);
    }
}
