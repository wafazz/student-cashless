<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\SchoolFeeStudent;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SchoolFeeController extends Controller
{
    public function index()
    {
        $studentIds = auth()->user()->students()->pluck('id');

        $assignments = SchoolFeeStudent::whereIn('student_id', $studentIds)
            ->with('fee.school', 'fee.schoolClass', 'student:id,name,class_name')
            ->whereHas('fee', fn($q) => $q->where('status', 'active'))
            ->latest()
            ->get();

        return Inertia::render('parent/SchoolFees', [
            'assignments' => $assignments,
            'walletBalance' => (float) auth()->user()->wallet_balance,
        ]);
    }

    public function pay(Request $request, SchoolFeeStudent $schoolFeeStudent)
    {
        $studentIds = auth()->user()->students()->pluck('id');
        if (!$studentIds->contains($schoolFeeStudent->student_id)) abort(403);

        if ($schoolFeeStudent->status === 'paid') {
            return back()->with('error', 'This fee has already been paid.');
        }

        $amount = $schoolFeeStudent->fee->amount;

        return DB::transaction(function () use ($schoolFeeStudent, $amount) {
            $user = User::lockForUpdate()->findOrFail(auth()->id());

            if ($user->wallet_balance < $amount) {
                return back()->with('error', 'Insufficient wallet balance. Current: RM' . number_format($user->wallet_balance, 2));
            }

            $balanceBefore = $user->wallet_balance;
            $user->wallet_balance -= $amount;
            $user->save();

            $ref = 'SFEE-' . now()->timestamp;

            $schoolFeeStudent->update([
                'amount_paid' => $amount,
                'status' => 'paid',
                'paid_at' => now(),
                'payment_method' => 'wallet',
                'reference_id' => $ref,
            ]);

            Transaction::create([
                'parent_id' => $user->id,
                'student_id' => $schoolFeeStudent->student_id,
                'type' => 'purchase',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $user->wallet_balance,
                'description' => 'School Fee: ' . $schoolFeeStudent->fee->name . ' (' . $schoolFeeStudent->student->name . ')',
                'reference_id' => $ref,
                'created_at' => now(),
            ]);

            return back()->with('success', 'Payment successful! RM' . number_format($amount, 2) . ' paid.');
        });
    }
}
