<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $school = School::findOrFail(auth()->user()->school_id);

        return Inertia::render('school/Settings', [
            'school' => $school,
        ]);
    }

    public function update(Request $request)
    {
        $school = School::findOrFail(auth()->user()->school_id);

        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'logo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->only(['name', 'address', 'phone', 'email']);

        if ($request->hasFile('logo')) {
            if ($school->logo && Storage::disk('public')->exists($school->logo)) {
                Storage::disk('public')->delete($school->logo);
            }
            $data['logo'] = $request->file('logo')->store('schools/logos', 'public');
        }

        $school->update($data);

        return back()->with('success', 'School settings updated.');
    }

    public function removeLogo()
    {
        $school = School::findOrFail(auth()->user()->school_id);

        if ($school->logo && Storage::disk('public')->exists($school->logo)) {
            Storage::disk('public')->delete($school->logo);
        }
        $school->update(['logo' => null]);

        return back()->with('success', 'Logo removed.');
    }
}
