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

        // Start after current subscription ends, or now if expired/none
        $currentEnd = $school->subscription_end;
        $hasActiveSub = $currentEnd && $currentEnd->isFuture();

        $start = $hasActiveSub ? $currentEnd : now();
        $end = $start->copy()->addDays($package->duration_days);

        $school->update([
            'package_id' => $package->id,
            'subscription_fee' => $package->price,
            'subscription_status' => $hasActiveSub ? $school->subscription_status : ($package->billing_cycle === 'trial' ? 'trial' : 'active'),
            'subscription_start' => $hasActiveSub ? $school->subscription_start : $start,
            'subscription_end' => $end,
        ]);

        $payment->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        $msg = $hasActiveSub
            ? "Approved! {$package->name} will start on {$start->format('d/m/Y')} (after current plan ends) until {$end->format('d/m/Y')}."
            : "Approved! {$school->name} subscribed to {$package->name} until {$end->format('d/m/Y')}.";

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
