<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Transaction;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index()
    {
        $canteen = auth()->user()->getCanteenForWork();
        if (!$canteen) {
            return Inertia::render('operator/Withdrawals', [
                'canteen' => null, 'balance' => 0, 'totalEarned' => 0,
                'totalWithdrawn' => 0, 'withdrawals' => [],
            ]);
        }

        $totalEarned = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')->sum('amount');
        $totalRefunded = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'refund')->sum('amount');
        $totalWithdrawn = Withdrawal::where('entity_type', 'store')
            ->where('entity_id', $canteen->id)
            ->whereIn('status', ['approved', 'paid'])
            ->sum('net_amount');

        $availableBalance = $totalEarned - $totalRefunded - $totalWithdrawn;

        $withdrawals = Withdrawal::where('entity_type', 'store')
            ->where('entity_id', $canteen->id)
            ->latest('requested_at')
            ->get();

        return Inertia::render('operator/Withdrawals', [
            'canteen' => $canteen,
            'balance' => round(max(0, $availableBalance), 2),
            'totalEarned' => round($totalEarned - $totalRefunded, 2),
            'totalWithdrawn' => round($totalWithdrawn, 2),
            'withdrawals' => $withdrawals,
            'feePercent' => (float) Setting::get('withdrawal_fee_store', '3'),
        ]);
    }

    public function updateBank(Request $request)
    {
        $canteen = auth()->user()->getCanteenForWork();
        if (!$canteen) return back()->with('error', 'No store assigned.');

        $request->validate([
            'bank_name' => 'required|string|max:100',
            'bank_account' => 'required|string|max:30',
            'bank_holder' => 'required|string|max:255',
        ]);

        $canteen->update($request->only(['bank_name', 'bank_account', 'bank_holder']));

        return back()->with('success', 'Bank details updated.');
    }

    public function request(Request $request)
    {
        $canteen = auth()->user()->getCanteenForWork();
        if (!$canteen) return back()->with('error', 'No store assigned.');

        if (!$canteen->bank_name || !$canteen->bank_account) {
            return back()->with('error', 'Please set up bank details first.');
        }

        $request->validate([
            'amount' => 'required|numeric|min:10',
        ]);

        $totalEarned = Transaction::where('canteen_id', $canteen->id)->where('type', 'purchase')->sum('amount');
        $totalRefunded = Transaction::where('canteen_id', $canteen->id)->where('type', 'refund')->sum('amount');
        $totalWithdrawn = Withdrawal::where('entity_type', 'store')
            ->where('entity_id', $canteen->id)
            ->whereIn('status', ['pending', 'approved', 'paid'])
            ->sum('net_amount');

        $available = $totalEarned - $totalRefunded - $totalWithdrawn;

        if ($request->amount > $available) {
            return back()->with('error', 'Amount exceeds available balance (RM' . number_format($available, 2) . ').');
        }

        $feePercent = (float) Setting::get('withdrawal_fee_store', '3');
        $platformFee = round($request->amount * ($feePercent / 100), 2);
        $netAmount = $request->amount - $platformFee;

        Withdrawal::create([
            'entity_type' => 'store',
            'entity_id' => $canteen->id,
            'entity_name' => $canteen->name,
            'amount' => $request->amount,
            'platform_fee' => $platformFee,
            'net_amount' => $netAmount,
            'bank_name' => $canteen->bank_name,
            'bank_account' => $canteen->bank_account,
            'bank_holder' => $canteen->bank_holder,
            'requested_at' => now(),
        ]);

        return back()->with('success', 'Withdrawal request submitted. Net: RM' . number_format($netAmount, 2) . " (after {$feePercent}% platform fee).");
    }
}
