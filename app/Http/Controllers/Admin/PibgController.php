<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PibgFee;
use App\Models\PibgFeeParent;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PibgController extends Controller
{
    public function index()
    {
        $schools = School::where('status', 'active')
            ->withCount('pibgFees')
            ->get()
            ->map(function ($school) {
                $school->total_collected = PibgFeeParent::where('school_id', $school->id)->where('status', 'paid')->sum('amount_paid');
                $school->total_outstanding = PibgFeeParent::where('school_id', $school->id)->where('status', 'unpaid')->count();
                return $school;
            });

        return Inertia::render('admin/Pibg', [
            'schools' => $schools,
        ]);
    }

    public function schoolUsers()
    {
        $users = User::where('role', 'school')->with('school')->latest()->get();
        $schools = School::where('status', 'active')->get();

        return Inertia::render('admin/SchoolUsers', [
            'users' => $users,
            'schools' => $schools,
        ]);
    }

    public function storeSchoolUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'school_id' => 'required|exists:schools,id',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'school',
            'school_id' => $request->school_id,
        ]);

        return back()->with('success', 'School user created.');
    }

    public function updateSchoolUser(Request $request, User $user)
    {
        if ($user->role !== 'school') abort(403);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'school_id' => 'required|exists:schools,id',
            'status' => 'in:active,inactive',
        ]);

        $user->update($request->only(['name', 'email', 'phone', 'school_id', 'status']));

        return back()->with('success', 'School user updated.');
    }
}
