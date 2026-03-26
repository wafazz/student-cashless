<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SubscriptionPackage;
use App\Models\SubscriptionPayment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $school = School::with('package')->findOrFail($user->school_id);

        $packages = SubscriptionPackage::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $payments = SubscriptionPayment::where('school_id', $school->id)
            ->with('package')
            ->latest()
            ->get();

        return Inertia::render('school/Subscription', [
            'school' => $school,
            'packages' => $packages,
            'payments' => $payments,
        ]);
    }

    public function subscribe(Request $request)
    {
        $user = auth()->user();
        $schoolId = $user->school_id;

        $package = SubscriptionPackage::findOrFail($request->package_id);
        $isTrial = $package->billing_cycle === 'trial';

        $request->validate([
            'package_id' => 'required|exists:subscription_packages,id',
            'receipt' => $isTrial ? 'nullable' : 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string|max:500',
        ]);

        // Active paid subscription: can only renew within 7 days before expiry
        $school = School::findOrFail($schoolId);
        if (!$isTrial && $school->subscription_status === 'active' && $school->subscription_end) {
            $daysLeft = now()->diffInDays($school->subscription_end, false);
            if ($daysLeft > 7) {
                return back()->with('error', 'You can only renew within 7 days before your subscription ends. (' . ceil($daysLeft) . ' days remaining)');
            }
        }

        // Trial can only be used once per school
        if ($isTrial) {
            $usedTrial = SubscriptionPayment::where('school_id', $schoolId)
                ->whereHas('package', fn($q) => $q->where('billing_cycle', 'trial'))
                ->whereIn('status', ['pending', 'approved'])
                ->exists();

            if ($usedTrial) {
                return back()->with('error', 'Trial package can only be used once per school.');
            }
        }

        // Check no pending payment
        $pending = SubscriptionPayment::where('school_id', $schoolId)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return back()->with('error', 'You already have a pending payment. Please wait for admin approval.');
        }

        $receiptPath = $request->hasFile('receipt')
            ? $request->file('receipt')->store('receipts/subscriptions', 'public')
            : '';

        $payment = SubscriptionPayment::create([
            'school_id' => $schoolId,
            'package_id' => $package->id,
            'amount' => $package->price,
            'receipt_path' => $receiptPath,
            'notes' => $request->notes,
        ]);

        // Auto-approve trial (free, no receipt needed)
        if ($isTrial) {
            $school = School::findOrFail($schoolId);
            $school->update([
                'package_id' => $package->id,
                'subscription_fee' => 0,
                'subscription_status' => 'trial',
                'subscription_start' => now(),
                'subscription_end' => now()->addDays($package->duration_days),
            ]);
            $payment->update(['status' => 'approved', 'approved_at' => now()]);

            return back()->with('success', 'Trial activated! You have ' . $package->duration_days . ' days of full access.');
        }

        return back()->with('success', 'Payment submitted! Admin will review and activate your subscription.');
    }
}
