<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SchoolRegistration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolRegistrationController extends Controller
{
    public function create()
    {
        return Inertia::render('SchoolRegister');
    }

    public function store(Request $request)
    {
        $request->validate([
            'school_name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'school_phone' => 'nullable|string|max:20',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'estimated_students' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        SchoolRegistration::create($request->only([
            'school_name', 'address', 'school_phone',
            'contact_name', 'contact_email', 'contact_phone',
            'estimated_students', 'notes',
        ]));

        return back()->with('success', 'Registration submitted! We will contact you soon.');
    }

    public function index()
    {
        $registrations = SchoolRegistration::latest()->get();

        return Inertia::render('admin/Registrations', [
            'registrations' => $registrations,
        ]);
    }

    public function update(Request $request, SchoolRegistration $registration)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $registration->update($request->only(['status', 'admin_notes']));

        // If approved, create the school automatically
        if ($request->status === 'approved') {
            $exists = School::where('name', $registration->school_name)->exists();
            if (!$exists) {
                School::create([
                    'name' => $registration->school_name,
                    'address' => $registration->address,
                    'phone' => $registration->school_phone,
                    'subscription_status' => 'trial',
                    'subscription_start' => now()->toDateString(),
                    'subscription_end' => now()->addDays(30)->toDateString(),
                ]);
            }
        }

        return back()->with('success', "Registration {$request->status}.");
    }
}
