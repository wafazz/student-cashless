<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScanController extends Controller
{
    public function index()
    {
        $canteen = auth()->user()->canteen;

        return Inertia::render('operator/Scan', [
            'canteen' => $canteen?->load('school', 'menuItems'),
        ]);
    }

    public function lookup(Request $request)
    {
        $request->validate([
            'wallet_uuid' => 'required|uuid',
        ]);

        $student = Student::where('wallet_uuid', $request->wallet_uuid)
            ->where('status', 'active')
            ->with('school')
            ->first();

        if (!$student) {
            return response()->json(['error' => 'Student not found or inactive.'], 404);
        }

        return response()->json([
            'id' => $student->id,
            'name' => $student->name,
            'class_name' => $student->class_name,
            'school' => $student->school->name,
            'wallet_balance' => $student->wallet_balance,
            'daily_limit' => $student->daily_limit,
            'daily_spent' => $student->daily_spent,
            'photo' => $student->photo,
        ]);
    }

    public function charge(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:0.10',
            'description' => 'nullable|string|max:255',
        ]);

        $canteen = auth()->user()->canteen;
        if (!$canteen) {
            return back()->with('error', 'No canteen assigned to your account.');
        }

        $amount = round($request->amount, 2);

        return DB::transaction(function () use ($request, $canteen, $amount) {
            $student = Student::lockForUpdate()->findOrFail($request->student_id);

            if ($student->status !== 'active') {
                return back()->with('error', 'Student account is inactive.');
            }

            if ($student->wallet_balance < $amount) {
                return back()->with('error', 'Insufficient balance. Current: RM' . number_format($student->wallet_balance, 2));
            }

            if ($student->daily_limit !== null && ($student->daily_spent + $amount) > $student->daily_limit) {
                $remaining = $student->daily_limit - $student->daily_spent;
                return back()->with('error', 'Daily limit exceeded. Remaining: RM' . number_format(max(0, $remaining), 2));
            }

            $balanceBefore = $student->wallet_balance;
            $student->wallet_balance -= $amount;
            $student->daily_spent += $amount;
            $student->save();

            Transaction::create([
                'student_id' => $student->id,
                'canteen_id' => $canteen->id,
                'operator_id' => auth()->id(),
                'type' => 'purchase',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $student->wallet_balance,
                'description' => $request->description,
                'created_at' => now(),
            ]);

            return back()->with('success', 'Charged RM' . number_format($amount, 2) . ' to ' . $student->name . '. Balance: RM' . number_format($student->wallet_balance, 2));
        });
    }
}
