<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $studentIds = $user->students()->pluck('id');

        $query = Transaction::where(function ($q) use ($studentIds, $user) {
                $q->whereIn('student_id', $studentIds)
                  ->orWhere('parent_id', $user->id);
            })
            ->with('student', 'canteen');

        if ($request->filled('student_id')) {
            if ($request->student_id === 'wallet') {
                $query->where('parent_id', $user->id)->whereNull('student_id');
            } else {
                $query->where('student_id', $request->student_id);
            }
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->latest('created_at')->paginate(20)->withQueryString();

        $students = auth()->user()->students()->get(['id', 'name']);

        return Inertia::render('parent/AllTransactions', [
            'transactions' => $transactions,
            'students' => $students,
            'filters' => $request->only(['student_id', 'type', 'date_from', 'date_to']),
        ]);
    }
}
