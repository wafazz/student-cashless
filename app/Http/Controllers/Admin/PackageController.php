<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index()
    {
        $packages = SubscriptionPackage::withCount('schools')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('admin/Packages', [
            'packages' => $packages,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:subscription_packages',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'billing_cycle' => 'required|in:trial,monthly,yearly',
            'features' => 'nullable|string',
        ]);

        $features = $request->features
            ? array_map('trim', explode("\n", $request->features))
            : [];

        SubscriptionPackage::create([
            ...$request->only(['name', 'slug', 'description', 'price', 'duration_days', 'billing_cycle']),
            'features' => $features,
            'sort_order' => SubscriptionPackage::max('sort_order') + 1,
        ]);

        return back()->with('success', 'Package created.');
    }

    public function update(Request $request, SubscriptionPackage $package)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'billing_cycle' => 'required|in:trial,monthly,yearly',
            'features' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $features = $request->features
            ? array_map('trim', explode("\n", $request->features))
            : [];

        $package->update([
            ...$request->only(['name', 'description', 'price', 'duration_days', 'billing_cycle', 'is_active']),
            'features' => $features,
        ]);

        return back()->with('success', 'Package updated.');
    }
}
