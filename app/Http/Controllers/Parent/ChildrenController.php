<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChildrenController extends Controller
{
    public function index()
    {
        $students = auth()->user()->students()->with('school')->get();
        $schools = School::where('status', 'active')->get();

        return Inertia::render('parent/Children', [
            'students' => $students,
            'schools' => $schools,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'school_id' => 'required|exists:schools,id',
            'ic_number' => 'nullable|string|max:20',
            'class_name' => 'nullable|string|max:100',
            'daily_limit' => 'nullable|numeric|min:0',
        ]);

        auth()->user()->students()->create($request->only([
            'name', 'school_id', 'ic_number', 'class_name', 'daily_limit',
        ]));

        return back()->with('success', 'Child added successfully.');
    }

    public function update(Request $request, Student $student)
    {
        if ($student->parent_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'school_id' => 'required|exists:schools,id',
            'ic_number' => 'nullable|string|max:20',
            'class_name' => 'nullable|string|max:100',
            'daily_limit' => 'nullable|numeric|min:0',
        ]);

        $student->update($request->only([
            'name', 'school_id', 'ic_number', 'class_name', 'daily_limit',
        ]));

        return back()->with('success', 'Child updated successfully.');
    }

    public function qr(Student $student)
    {
        if ($student->parent_id !== auth()->id()) {
            abort(403);
        }

        $student->load('school');

        return Inertia::render('parent/QrCode', [
            'student' => $student,
        ]);
    }

    public function transactions(Student $student)
    {
        if ($student->parent_id !== auth()->id()) {
            abort(403);
        }

        $transactions = $student->transactions()
            ->with('canteen')
            ->latest('created_at')
            ->paginate(20);

        return Inertia::render('parent/Transactions', [
            'student' => $student->load('school'),
            'transactions' => $transactions,
        ]);
    }
}
