<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\PibgFee;
use App\Models\PibgFeeParent;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PibgFeeController extends Controller
{
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $fees = PibgFee::where('school_id', $schoolId)
            ->withCount([
                'parents as paid_count' => fn($q) => $q->where('status', 'paid'),
                'parents as unpaid_count' => fn($q) => $q->where('status', 'unpaid'),
                'parents as parents_count',
            ])
            ->latest()
            ->get();

        return Inertia::render('school/PibgFees', [
            'fees' => $fees,
        ]);
    }

    public function store(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'academic_year' => 'required|string|max:20',
            'due_date' => 'required|date',
            'description' => 'nullable|string|max:1000',
        ]);

        $fee = PibgFee::create([
            'school_id' => $schoolId,
            ...$request->only(['name', 'amount', 'academic_year', 'due_date', 'description']),
        ]);

        // Auto-assign to unique parents in this school
        $parentIds = Student::where('school_id', $schoolId)
            ->where('status', 'active')
            ->distinct()
            ->pluck('parent_id');

        $assignments = $parentIds->map(fn($parentId) => [
            'pibg_fee_id' => $fee->id,
            'parent_id' => $parentId,
            'school_id' => $schoolId,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        PibgFeeParent::insert($assignments);

        return back()->with('success', "Fee created and assigned to {$parentIds->count()} families.");
    }

    public function show(PibgFee $pibgFee)
    {
        $schoolId = auth()->user()->school_id;
        if ($pibgFee->school_id !== $schoolId) abort(403);

        $assignments = PibgFeeParent::where('pibg_fee_id', $pibgFee->id)
            ->with('parent:id,name,email,phone')
            ->orderByRaw("FIELD(status, 'unpaid', 'paid')")
            ->get();

        return Inertia::render('school/PibgFeeDetail', [
            'fee' => $pibgFee,
            'assignments' => $assignments,
        ]);
    }

    public function update(Request $request, PibgFee $pibgFee)
    {
        $schoolId = auth()->user()->school_id;
        if ($pibgFee->school_id !== $schoolId) abort(403);

        $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'due_date' => 'required|date',
            'description' => 'nullable|string|max:1000',
            'status' => 'in:active,inactive',
        ]);

        $oldAmount = $pibgFee->amount;
        $pibgFee->update($request->only(['name', 'amount', 'due_date', 'description', 'status']));

        // If amount changed, update unpaid assignments
        if ($request->amount != $oldAmount) {
            PibgFeeParent::where('pibg_fee_id', $pibgFee->id)
                ->where('status', 'unpaid')
                ->update(['amount_paid' => 0]);
        }

        return back()->with('success', 'Fee updated.');
    }

    public function destroy(PibgFee $pibgFee)
    {
        $schoolId = auth()->user()->school_id;
        if ($pibgFee->school_id !== $schoolId) abort(403);

        $hasPaid = PibgFeeParent::where('pibg_fee_id', $pibgFee->id)->where('status', 'paid')->exists();
        if ($hasPaid) {
            return back()->with('error', 'Cannot delete fee with existing payments.');
        }

        $pibgFee->delete();
        return redirect()->route('school.pibg-fees')->with('success', 'Fee deleted.');
    }

    public function reassign(PibgFee $pibgFee)
    {
        $schoolId = auth()->user()->school_id;
        if ($pibgFee->school_id !== $schoolId) abort(403);

        $existingParentIds = PibgFeeParent::where('pibg_fee_id', $pibgFee->id)->pluck('parent_id');

        $newParentIds = Student::where('school_id', $schoolId)
            ->where('status', 'active')
            ->distinct()
            ->pluck('parent_id')
            ->diff($existingParentIds);

        if ($newParentIds->isEmpty()) {
            return back()->with('success', 'No new families to assign.');
        }

        $assignments = $newParentIds->map(fn($parentId) => [
            'pibg_fee_id' => $pibgFee->id,
            'parent_id' => $parentId,
            'school_id' => $schoolId,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        PibgFeeParent::insert($assignments);

        return back()->with('success', "Assigned to {$newParentIds->count()} new families.");
    }
}
