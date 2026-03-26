<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\PibgFeeParent;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PibgFeeController extends Controller
{
    public function index()
    {
        $assignments = PibgFeeParent::where('parent_id', auth()->id())
            ->with('fee.school')
            ->whereHas('fee', fn($q) => $q->where('status', 'active'))
            ->latest()
            ->get();

        return Inertia::render('parent/PibgFees', [
            'assignments' => $assignments,
            'walletBalance' => (float) auth()->user()->wallet_balance,
        ]);
    }

    public function pay(Request $request, PibgFeeParent $pibgFeeParent)
    {
        if ($pibgFeeParent->parent_id !== auth()->id()) abort(403);
        if ($pibgFeeParent->status === 'paid') {
            return back()->with('error', 'This fee has already been paid.');
        }

        $request->validate([
            'payment_method' => 'required|in:wallet',
        ]);

        $amount = $pibgFeeParent->fee->amount;

        return DB::transaction(function () use ($pibgFeeParent, $amount) {
            $user = User::lockForUpdate()->findOrFail(auth()->id());

            if ($user->wallet_balance < $amount) {
                return back()->with('error', 'Insufficient wallet balance. Current: RM' . number_format($user->wallet_balance, 2));
            }

            $balanceBefore = $user->wallet_balance;
            $user->wallet_balance -= $amount;
            $user->save();

            $ref = 'PIBG-' . now()->timestamp;

            $pibgFeeParent->update([
                'amount_paid' => $amount,
                'status' => 'paid',
                'paid_at' => now(),
                'payment_method' => 'wallet',
                'reference_id' => $ref,
            ]);

            Transaction::create([
                'parent_id' => $user->id,
                'type' => 'purchase',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $user->wallet_balance,
                'description' => 'PIBG: ' . $pibgFeeParent->fee->name,
                'reference_id' => $ref,
                'created_at' => now(),
            ]);

            return back()->with('success', 'Payment successful! RM' . number_format($amount, 2) . ' paid for ' . $pibgFeeParent->fee->name);
        });
    }
}
