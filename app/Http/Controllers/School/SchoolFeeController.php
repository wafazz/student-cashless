<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\SchoolFee;
use App\Models\SchoolFeeStudent;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolFeeController extends Controller
{
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $fees = SchoolFee::where('school_id', $schoolId)
            ->with('schoolClass:id,name')
            ->withCount([
                'students as paid_count' => fn($q) => $q->where('status', 'paid'),
                'students as unpaid_count' => fn($q) => $q->where('status', 'unpaid'),
            ])
            ->latest()
            ->get();

        $classes = SchoolClass::where('school_id', $schoolId)->where('status', 'active')->orderBy('name')->get();

        return Inertia::render('school/SchoolFees', [
            'fees' => $fees,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $request->validate([
            'name' => 'required|string|max:255',
            'class_id' => 'nullable|exists:school_classes,id',
            'amount' => 'required|numeric|min:1',
            'academic_year' => 'required|string|max:20',
            'due_date' => 'required|date',
            'description' => 'nullable|string|max:1000',
        ]);

        $fee = SchoolFee::create([
            'school_id' => $schoolId,
            ...$request->only(['name', 'class_id', 'amount', 'academic_year', 'due_date', 'description']),
        ]);

        // Auto-assign to students
        $query = Student::where('school_id', $schoolId)->where('status', 'active');
        if ($request->class_id) {
            $query->where('class_id', $request->class_id);
        }
        $studentIds = $query->pluck('id');

        $assignments = $studentIds->map(fn($sid) => [
            'school_fee_id' => $fee->id,
            'student_id' => $sid,
            'school_id' => $schoolId,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        SchoolFeeStudent::insert($assignments);

        $classLabel = $request->class_id
            ? SchoolClass::find($request->class_id)?->name
            : 'all classes';

        return back()->with('success', "Fee created and assigned to {$studentIds->count()} students ({$classLabel}).");
    }

    public function show(SchoolFee $schoolFee)
    {
        $schoolId = auth()->user()->school_id;
        if ($schoolFee->school_id !== $schoolId) abort(403);

        $assignments = SchoolFeeStudent::where('school_fee_id', $schoolFee->id)
            ->with('student:id,name,class_name,class_id', 'student.parent:id,name,phone,email')
            ->orderByRaw("FIELD(status, 'unpaid', 'paid')")
            ->get();

        return Inertia::render('school/SchoolFeeDetail', [
            'fee' => $schoolFee->load('schoolClass:id,name'),
            'assignments' => $assignments,
        ]);
    }

    public function update(Request $request, SchoolFee $schoolFee)
    {
        $schoolId = auth()->user()->school_id;
        if ($schoolFee->school_id !== $schoolId) abort(403);

        $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'due_date' => 'required|date',
            'description' => 'nullable|string|max:1000',
            'status' => 'in:active,inactive',
        ]);

        $schoolFee->update($request->only(['name', 'amount', 'due_date', 'description', 'status']));

        return back()->with('success', 'Fee updated.');
    }

    public function destroy(SchoolFee $schoolFee)
    {
        $schoolId = auth()->user()->school_id;
        if ($schoolFee->school_id !== $schoolId) abort(403);

        $hasPaid = SchoolFeeStudent::where('school_fee_id', $schoolFee->id)->where('status', 'paid')->exists();
        if ($hasPaid) {
            return back()->with('error', 'Cannot delete fee with existing payments.');
        }

        $schoolFee->delete();
        return redirect()->route('school.school-fees')->with('success', 'Fee deleted.');
    }
}
