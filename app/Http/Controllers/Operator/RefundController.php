<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RefundController extends Controller
{
    public function index()
    {
        $canteen = auth()->user()->getCanteenForWork();

        if (!$canteen) {
            return Inertia::render('operator/Refund', [
                'canteen' => null,
                'recentCharges' => [],
            ]);
        }

        $recentCharges = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', now()->toDateString())
            ->with('student')
            ->latest('created_at')
            ->take(20)
            ->get()
            ->map(function ($tx) {
                // Resolve name: student or parent
                $name = $tx->student?->name;
                if (!$name && $tx->parent_id) {
                    $parent = User::find($tx->parent_id);
                    $name = $parent ? $parent->name . ' (Parent)' : 'Unknown';
                }
                $tx->display_name = $name ?: 'Unknown';
                return $tx;
            });

        return Inertia::render('operator/Refund', [
            'canteen' => $canteen,
            'recentCharges' => $recentCharges,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'reason' => 'nullable|string|max:255',
        ]);

        $canteen = auth()->user()->getCanteenForWork();
        if (!$canteen) {
            return back()->with('error', 'No store assigned.');
        }

        $originalTx = Transaction::where('id', $request->transaction_id)
            ->where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->firstOrFail();

        if (!$originalTx->created_at->isToday()) {
            return back()->with('error', 'Can only refund today\'s transactions.');
        }

        $alreadyRefunded = Transaction::where('reference_id', "REF-{$originalTx->id}")
            ->where('type', 'refund')
            ->exists();

        if ($alreadyRefunded) {
            return back()->with('error', 'This transaction has already been refunded.');
        }

        // Parent wallet refund
        if ($originalTx->parent_id && !$originalTx->student_id) {
            return $this->refundParent($originalTx, $request);
        }

        // Student wallet refund
        return $this->refundStudent($originalTx, $request);
    }

    private function refundStudent(Transaction $originalTx, Request $request)
    {
        return DB::transaction(function () use ($originalTx, $request) {
            $student = Student::lockForUpdate()->findOrFail($originalTx->student_id);

            $balanceBefore = $student->wallet_balance;
            $student->wallet_balance += $originalTx->amount;
            $student->daily_spent = max(0, $student->daily_spent - $originalTx->amount);
            $student->save();

            Transaction::create([
                'student_id' => $student->id,
                'canteen_id' => $originalTx->canteen_id,
                'operator_id' => auth()->id(),
                'type' => 'refund',
                'amount' => $originalTx->amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $student->wallet_balance,
                'description' => 'Refund: ' . ($request->reason ?: $originalTx->description),
                'reference_id' => "REF-{$originalTx->id}",
                'created_at' => now(),
            ]);

            return back()->with('success', 'Refunded RM' . number_format($originalTx->amount, 2) . ' to ' . $student->name);
        });
    }

    private function refundParent(Transaction $originalTx, Request $request)
    {
        return DB::transaction(function () use ($originalTx, $request) {
            $parent = User::lockForUpdate()->findOrFail($originalTx->parent_id);

            $balanceBefore = $parent->wallet_balance;
            $parent->wallet_balance += $originalTx->amount;
            $parent->save();

            Transaction::create([
                'parent_id' => $parent->id,
                'canteen_id' => $originalTx->canteen_id,
                'operator_id' => auth()->id(),
                'type' => 'refund',
                'amount' => $originalTx->amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $parent->wallet_balance,
                'description' => 'Refund: ' . ($request->reason ?: $originalTx->description),
                'reference_id' => "REF-{$originalTx->id}",
                'created_at' => now(),
            ]);

            return back()->with('success', 'Refunded RM' . number_format($originalTx->amount, 2) . ' to ' . $parent->name . ' (Parent)');
        });
    }
}
