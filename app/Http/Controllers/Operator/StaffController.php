<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\CanteenStaff;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index()
    {
        $canteen = auth()->user()->canteen;

        if (!$canteen) {
            return Inertia::render('operator/Staff', [
                'canteen' => null,
                'staff' => [],
            ]);
        }

        $staff = CanteenStaff::where('canteen_id', $canteen->id)
            ->with('user')
            ->latest()
            ->get();

        return Inertia::render('operator/Staff', [
            'canteen' => $canteen->load('school'),
            'staff' => $staff,
        ]);
    }

    public function store(Request $request)
    {
        $canteen = auth()->user()->canteen;
        if (!$canteen) {
            return back()->with('error', 'No store assigned.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'position' => 'required|in:cashier,manager',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'cashier',
        ]);

        CanteenStaff::create([
            'canteen_id' => $canteen->id,
            'user_id' => $user->id,
            'position' => $request->position,
        ]);

        return back()->with('success', 'Staff member added.');
    }

    public function update(Request $request, CanteenStaff $staff)
    {
        $canteen = auth()->user()->canteen;
        if (!$canteen || $staff->canteen_id !== $canteen->id) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->user_id,
            'phone' => 'nullable|string|max:20',
            'position' => 'required|in:cashier,manager',
            'status' => 'required|in:active,inactive',
        ]);

        $staff->user->update($request->only(['name', 'email', 'phone']));
        $staff->user->update(['status' => $request->status]);
        $staff->update(['position' => $request->position, 'status' => $request->status]);

        return back()->with('success', 'Staff updated.');
    }
}
