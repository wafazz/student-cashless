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

        $request->validate([
            'package_id' => 'required|exists:subscription_packages,id',
            'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'notes' => 'nullable|string|max:500',
        ]);

        $package = SubscriptionPackage::findOrFail($request->package_id);

        // Check no pending payment
        $pending = SubscriptionPayment::where('school_id', $schoolId)
            ->where('status', 'pending')
            ->exists();

        if ($pending) {
            return back()->with('error', 'You already have a pending payment. Please wait for admin approval.');
        }

        $receiptPath = $request->file('receipt')->store('receipts/subscriptions', 'public');

        SubscriptionPayment::create([
            'school_id' => $schoolId,
            'package_id' => $package->id,
            'amount' => $package->price,
            'receipt_path' => $receiptPath,
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Payment submitted! Admin will review and activate your subscription.');
    }
}
