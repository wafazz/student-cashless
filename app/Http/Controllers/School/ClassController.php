<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $classes = SchoolClass::where('school_id', $schoolId)
            ->withCount('students')
            ->orderBy('name')
            ->get();

        return Inertia::render('school/Classes', [
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $schoolId = auth()->user()->school_id;

        $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'nullable|string|max:50',
        ]);

        $exists = SchoolClass::where('school_id', $schoolId)->where('name', $request->name)->exists();
        if ($exists) {
            return back()->with('error', 'Class name already exists.');
        }

        SchoolClass::create([
            'school_id' => $schoolId,
            'name' => $request->name,
            'level' => $request->level,
        ]);

        return back()->with('success', 'Class added.');
    }

    public function update(Request $request, SchoolClass $schoolClass)
    {
        $schoolId = auth()->user()->school_id;
        if ($schoolClass->school_id !== $schoolId) abort(403);

        $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'nullable|string|max:50',
            'status' => 'in:active,inactive',
        ]);

        $schoolClass->update($request->only(['name', 'level', 'status']));

        return back()->with('success', 'Class updated.');
    }

    public function destroy(SchoolClass $schoolClass)
    {
        $schoolId = auth()->user()->school_id;
        if ($schoolClass->school_id !== $schoolId) abort(403);

        if ($schoolClass->students()->count() > 0) {
            return back()->with('error', 'Cannot delete class with students assigned.');
        }

        $schoolClass->delete();
        return back()->with('success', 'Class deleted.');
    }
}
