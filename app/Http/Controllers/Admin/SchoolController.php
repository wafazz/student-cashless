<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolController extends Controller
{
    public function index()
    {
        $schools = School::withCount('students', 'canteens')->latest()->get();

        return Inertia::render('admin/Schools', [
            'schools' => $schools,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
        ]);

        School::create($request->only(['name', 'address', 'phone']));

        return back()->with('success', 'School added.');
    }

    public function update(Request $request, School $school)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'status' => 'in:active,inactive',
            'subscription_fee' => 'nullable|numeric|min:0',
            'subscription_status' => 'nullable|in:active,inactive,trial',
            'subscription_start' => 'nullable|date',
            'subscription_end' => 'nullable|date',
        ]);

        $school->update($request->only([
            'name', 'address', 'phone', 'status',
            'subscription_fee', 'subscription_status', 'subscription_start', 'subscription_end',
        ]));

        return back()->with('success', 'School updated.');
    }
}
