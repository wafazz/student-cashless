<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Canteen;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $stores = Canteen::where('school_id', $schoolId)
            ->with('operator:id,name,email,phone,status')
            ->withCount('menuItems', 'transactions')
            ->latest()
            ->get();

        return Inertia::render('school/Stores', [
            'stores' => $stores,
        ]);
    }

    public function store(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:canteen,koperasi',
            'operator_name' => 'required|string|max:255',
            'operator_email' => 'required|email|unique:users,email',
            'operator_phone' => 'nullable|string|max:20',
            'operator_password' => 'required|string|min:8',
            'contract_fee' => 'nullable|numeric|min:0',
            'contract_start' => 'nullable|date',
            'contract_end' => 'nullable|date',
            'contract_notes' => 'nullable|string|max:1000',
        ]);

        $operator = User::create([
            'name' => $request->operator_name,
            'email' => $request->operator_email,
            'phone' => $request->operator_phone,
            'password' => $request->operator_password,
            'role' => 'operator',
        ]);

        Canteen::create([
            'school_id' => $schoolId,
            'operator_id' => $operator->id,
            'name' => $request->name,
            'type' => $request->type,
            'contract_fee' => $request->contract_fee ?? 0,
            'contract_start' => $request->contract_start,
            'contract_end' => $request->contract_end,
            'contract_notes' => $request->contract_notes,
        ]);

        $typeLabel = $request->type === 'koperasi' ? 'Koperasi' : 'Kantin';
        return back()->with('success', "{$typeLabel} '{$request->name}' registered with operator {$request->operator_name}.");
    }

    public function update(Request $request, Canteen $canteen)
    {
        $schoolId = auth()->user()->school_id;
        if ($canteen->school_id !== $schoolId) abort(403);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:canteen,koperasi',
            'status' => 'in:active,inactive',
            'contract_fee' => 'nullable|numeric|min:0',
            'contract_start' => 'nullable|date',
            'contract_end' => 'nullable|date',
            'contract_notes' => 'nullable|string|max:1000',
        ]);

        $canteen->update($request->only(['name', 'type', 'status', 'contract_fee', 'contract_start', 'contract_end', 'contract_notes']));

        return back()->with('success', 'Store updated.');
    }
}
