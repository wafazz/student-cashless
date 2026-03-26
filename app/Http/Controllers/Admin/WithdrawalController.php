<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $query = Withdrawal::latest('requested_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        $withdrawals = $query->paginate(20)->withQueryString();

        $stats = [
            'pending' => Withdrawal::where('status', 'pending')->count(),
            'pendingAmount' => Withdrawal::where('status', 'pending')->sum('net_amount'),
            'totalPaid' => Withdrawal::where('status', 'paid')->sum('net_amount'),
            'totalFees' => Withdrawal::whereIn('status', ['approved', 'paid'])->sum('platform_fee'),
        ];

        return Inertia::render('admin/Withdrawals', [
            'withdrawals' => $withdrawals,
            'stats' => $stats,
            'filters' => $request->only(['status', 'entity_type']),
        ]);
    }

    public function approve(Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Can only approve pending withdrawals.');
        }

        $withdrawal->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', "Approved RM{$withdrawal->net_amount} withdrawal for {$withdrawal->entity_name}.");
    }

    public function markPaid(Request $request, Withdrawal $withdrawal)
    {
        if (!in_array($withdrawal->status, ['approved'])) {
            return back()->with('error', 'Can only mark approved withdrawals as paid.');
        }

        $request->validate([
            'payment_reference' => 'required|string|max:255',
        ]);

        $withdrawal->update([
            'status' => 'paid',
            'paid_at' => now(),
            'payment_reference' => $request->payment_reference,
        ]);

        return back()->with('success', "Marked as paid. Ref: {$request->payment_reference}");
    }

    public function reject(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Can only reject pending withdrawals.');
        }

        $withdrawal->update([
            'status' => 'rejected',
            'admin_notes' => $request->admin_notes,
        ]);

        return back()->with('success', 'Withdrawal rejected.');
    }
}
