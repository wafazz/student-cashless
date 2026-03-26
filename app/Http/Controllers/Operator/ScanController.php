<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\LowBalanceNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ScanController extends Controller
{
    public function index()
    {
        $canteen = auth()->user()->getCanteenForWork();

        return Inertia::render('operator/Scan', [
            'canteen' => $canteen?->load('school', 'menuItems'),
        ]);
    }

    public function lookup(Request $request)
    {
        $uuid = trim($request->input('wallet_uuid', ''));

        if (preg_match('/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i', $uuid, $matches)) {
            $uuid = $matches[0];
        }

        if (!$uuid || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {
            return response()->json(['error' => 'Invalid QR code format.'], 422);
        }

        // Try student first
        $student = Student::where('wallet_uuid', $uuid)->where('status', 'active')->with('school')->first();

        if ($student) {
            return response()->json([
                'type' => 'student',
                'id' => $student->id,
                'name' => $student->name,
                'class_name' => $student->class_name,
                'school' => $student->school->name,
                'wallet_balance' => $student->wallet_balance,
                'daily_limit' => $student->daily_limit,
                'daily_spent' => $student->daily_spent,
                'photo' => $student->photo ? asset('storage/' . $student->photo) : null,
            ]);
        }

        // Try parent
        $parent = User::where('wallet_uuid', $uuid)->where('role', 'parent')->where('status', 'active')->first();

        if ($parent) {
            return response()->json([
                'type' => 'parent',
                'id' => $parent->id,
                'name' => $parent->name,
                'class_name' => 'Parent',
                'school' => 'General Wallet',
                'wallet_balance' => $parent->wallet_balance,
                'daily_limit' => null,
                'daily_spent' => 0,
                'photo' => null,
            ]);
        }

        return response()->json(['error' => 'Account not found or inactive.'], 404);
    }

    public function charge(Request $request)
    {
        $request->validate([
            'student_id' => 'nullable|exists:students,id',
            'parent_id' => 'nullable|exists:users,id',
            'amount' => 'required|numeric|min:0.10',
            'description' => 'nullable|string|max:255',
        ]);

        if (!$request->student_id && !$request->parent_id) {
            return back()->with('error', 'No account specified.');
        }

        $canteen = auth()->user()->getCanteenForWork();
        if (!$canteen) {
            return back()->with('error', 'No store assigned to your account.');
        }

        $amount = round($request->amount, 2);

        // Charge parent wallet
        if ($request->parent_id) {
            return $this->chargeParent($request, $canteen, $amount);
        }

        // Charge student wallet
        return $this->chargeStudent($request, $canteen, $amount);
    }

    private function chargeStudent(Request $request, $canteen, float $amount)
    {
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

            if ($student->wallet_balance < 5 && $student->parent) {
                $student->parent->notify(new LowBalanceNotification($student));
            }

            return back()->with('success', 'Charged RM' . number_format($amount, 2) . ' to ' . $student->name . '. Balance: RM' . number_format($student->wallet_balance, 2));
        });
    }

    private function chargeParent(Request $request, $canteen, float $amount)
    {
        return DB::transaction(function () use ($request, $canteen, $amount) {
            $parent = User::lockForUpdate()->findOrFail($request->parent_id);

            if ($parent->wallet_balance < $amount) {
                return back()->with('error', 'Insufficient balance. Current: RM' . number_format($parent->wallet_balance, 2));
            }

            $balanceBefore = $parent->wallet_balance;
            $parent->wallet_balance -= $amount;
            $parent->save();

            Transaction::create([
                'parent_id' => $parent->id,
                'canteen_id' => $canteen->id,
                'operator_id' => auth()->id(),
                'type' => 'purchase',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $parent->wallet_balance,
                'description' => $request->description,
                'reference_id' => 'PW-' . now()->timestamp,
                'created_at' => now(),
            ]);

            return back()->with('success', 'Charged RM' . number_format($amount, 2) . ' to ' . $parent->name . ' (Parent). Balance: RM' . number_format($parent->wallet_balance, 2));
        });
    }
}
