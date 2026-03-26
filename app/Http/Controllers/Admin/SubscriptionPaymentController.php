<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SubscriptionPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = SubscriptionPayment::with('school', 'package', 'approver')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->paginate(20)->withQueryString();

        $pendingCount = SubscriptionPayment::where('status', 'pending')->count();

        return Inertia::render('admin/SubscriptionPayments', [
            'payments' => $payments,
            'pendingCount' => $pendingCount,
            'filters' => $request->only('status'),
        ]);
    }

    public function approve(SubscriptionPayment $payment)
    {
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Can only approve pending payments.');
        }

        $package = $payment->package;
        $school = $payment->school;

        // Paid plans always start on 1st of next month
        // If school has active sub, start 1st of month after it ends
        $currentEnd = $school->subscription_end;
        $hasActiveSub = $currentEnd && $currentEnd->isFuture();
        $isTrial = $package->billing_cycle === 'trial';

        if ($isTrial) {
            $start = now();
            $end = now()->addDays($package->duration_days);

            $school->update([
                'package_id' => $package->id,
                'subscription_fee' => 0,
                'subscription_status' => 'trial',
                'subscription_start' => $start,
                'subscription_end' => $end,
            ]);

            $msg = "Approved! {$school->name} trial activated until {$end->format('d/m/Y')}.";
        } else {
            $isOnTrial = $hasActiveSub && $school->subscription_status === 'trial';
            $isExpired = !$hasActiveSub; // subscription already ended

            if ($isOnTrial) {
                // Trial active → paid starts 1st of next month, trial extends to fill gap
                $start = $currentEnd->copy()->startOfMonth()->addMonth();
            } elseif ($isExpired) {
                // Expired → paid starts 1st of current month (retroactive, covers this month)
                $start = now()->startOfMonth();
            } else {
                // Active paid (renewal) → starts 1st of month after current ends
                $start = $currentEnd->copy()->startOfMonth()->addMonth();
            }

            $end = $package->billing_cycle === 'yearly'
                ? $start->copy()->addYear()
                : $start->copy()->addMonth();

            $trialExtendEnd = $start->copy()->subDay();

            $school->update([
                'package_id' => $package->id,
                'subscription_fee' => $package->price,
                'subscription_status' => $isOnTrial ? 'trial' : 'active',
                'subscription_start' => $start,
                'subscription_end' => $end,
            ]);

            $msg = $isOnTrial
                ? "Approved! Trial extended to {$trialExtendEnd->format('d/m/Y')}. {$package->name} starts {$start->format('d/m/Y')} until {$end->format('d/m/Y')}."
                : "Approved! {$package->name} starts {$start->format('d/m/Y')} until {$end->format('d/m/Y')}.";
        }

        $payment->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', $msg);
    }

    public function reject(Request $request, SubscriptionPayment $payment)
    {
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Can only reject pending payments.');
        }

        $payment->update([
            'status' => 'rejected',
            'admin_notes' => $request->admin_notes,
        ]);

        return back()->with('success', 'Payment rejected.');
    }
}
