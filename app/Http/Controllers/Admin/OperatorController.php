<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Canteen;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorController extends Controller
{
    public function index()
    {
        $operators = User::where('role', 'operator')
            ->with('canteen.school')
            ->latest()
            ->get();

        $schools = School::where('status', 'active')->with('canteens')->get();

        return Inertia::render('admin/Operators', [
            'operators' => $operators,
            'schools' => $schools,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'school_id' => 'required|exists:schools,id',
            'canteen_name' => 'required|string|max:255',
            'canteen_type' => 'required|in:canteen,koperasi',
            'contract_fee' => 'nullable|numeric|min:0',
            'contract_start' => 'nullable|date',
            'contract_end' => 'nullable|date',
            'contract_notes' => 'nullable|string|max:1000',
        ]);

        $operator = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'operator',
        ]);

        Canteen::create([
            'school_id' => $request->school_id,
            'operator_id' => $operator->id,
            'name' => $request->canteen_name,
            'type' => $request->canteen_type,
            'contract_fee' => $request->contract_fee ?? 0,
            'contract_start' => $request->contract_start,
            'contract_end' => $request->contract_end,
            'contract_notes' => $request->contract_notes,
        ]);

        $typeLabel = $request->canteen_type === 'koperasi' ? 'Koperasi' : 'Canteen';
        return back()->with('success', "{$typeLabel} owner & store created.");
    }

    public function update(Request $request, User $operator)
    {
        if ($operator->role !== 'operator') {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $operator->id,
            'phone' => 'nullable|string|max:20',
            'status' => 'in:active,inactive',
        ]);

        $operator->update($request->only(['name', 'email', 'phone', 'status']));

        return back()->with('success', 'Operator updated.');
    }
}
