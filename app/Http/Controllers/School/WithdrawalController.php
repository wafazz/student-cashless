<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\PibgFeeParent;
use App\Models\SchoolFeeStudent;
use App\Models\Setting;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $schoolId = $user->school_id;

        $pibgCollected = PibgFeeParent::where('school_id', $schoolId)->where('status', 'paid')->sum('amount_paid');
        $schoolFeeCollected = SchoolFeeStudent::where('school_id', $schoolId)->where('status', 'paid')->sum('amount_paid');
        $totalEarned = $pibgCollected + $schoolFeeCollected;

        $totalWithdrawn = Withdrawal::where('entity_type', 'school')
            ->where('entity_id', $schoolId)
            ->whereIn('status', ['approved', 'paid'])
            ->sum('net_amount');

        $availableBalance = $totalEarned - $totalWithdrawn;

        $withdrawals = Withdrawal::where('entity_type', 'school')
            ->where('entity_id', $schoolId)
            ->latest('requested_at')
            ->get();

        return Inertia::render('school/Withdrawals', [
            'balance' => round(max(0, $availableBalance), 2),
            'totalEarned' => round($totalEarned, 2),
            'pibgCollected' => round($pibgCollected, 2),
            'schoolFeeCollected' => round($schoolFeeCollected, 2),
            'totalWithdrawn' => round($totalWithdrawn, 2),
            'bankDetails' => [
                'bank_name' => $user->bank_name,
                'bank_account' => $user->bank_account,
                'bank_holder' => $user->bank_holder,
            ],
            'withdrawals' => $withdrawals,
            'feePercent' => (float) Setting::get('withdrawal_fee_school', '2'),
        ]);
    }

    public function updateBank(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string|max:100',
            'bank_account' => 'required|string|max:30',
            'bank_holder' => 'required|string|max:255',
        ]);

        auth()->user()->update($request->only(['bank_name', 'bank_account', 'bank_holder']));

        return back()->with('success', 'Bank details updated.');
    }

    public function request(Request $request)
    {
        $user = auth()->user();
        $schoolId = $user->school_id;

        if (!$user->bank_name || !$user->bank_account) {
            return back()->with('error', 'Please set up bank details first.');
        }

        $request->validate([
            'amount' => 'required|numeric|min:10',
        ]);

        $totalEarned = PibgFeeParent::where('school_id', $schoolId)->where('status', 'paid')->sum('amount_paid')
            + SchoolFeeStudent::where('school_id', $schoolId)->where('status', 'paid')->sum('amount_paid');
        $totalWithdrawn = Withdrawal::where('entity_type', 'school')
            ->where('entity_id', $schoolId)
            ->whereIn('status', ['pending', 'approved', 'paid'])
            ->sum('net_amount');

        $available = $totalEarned - $totalWithdrawn;

        if ($request->amount > $available) {
            return back()->with('error', 'Amount exceeds available balance (RM' . number_format($available, 2) . ').');
        }

        $feePercent = (float) Setting::get('withdrawal_fee_school', '2');
        $platformFee = round($request->amount * ($feePercent / 100), 2);
        $netAmount = $request->amount - $platformFee;

        Withdrawal::create([
            'entity_type' => 'school',
            'entity_id' => $schoolId,
            'entity_name' => $user->school?->name ?? 'School',
            'amount' => $request->amount,
            'platform_fee' => $platformFee,
            'net_amount' => $netAmount,
            'bank_name' => $user->bank_name,
            'bank_account' => $user->bank_account,
            'bank_holder' => $user->bank_holder,
            'requested_at' => now(),
        ]);

        return back()->with('success', 'Withdrawal request submitted. Net: RM' . number_format($netAmount, 2) . " (after {$feePercent}% platform fee).");
    }
}
