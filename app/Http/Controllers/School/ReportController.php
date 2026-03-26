<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\PibgFee;
use App\Models\PibgFeeParent;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $fees = PibgFee::where('school_id', $schoolId)
            ->withCount([
                'parents as paid_count' => fn($q) => $q->where('status', 'paid'),
                'parents as unpaid_count' => fn($q) => $q->where('status', 'unpaid'),
            ])
            ->latest()
            ->get()
            ->map(function ($fee) {
                $fee->total_collected = PibgFeeParent::where('pibg_fee_id', $fee->id)->where('status', 'paid')->sum('amount_paid');
                $fee->total_expected = ($fee->paid_count + $fee->unpaid_count) * $fee->amount;
                return $fee;
            });

        $outstanding = PibgFeeParent::where('school_id', $schoolId)
            ->where('status', 'unpaid')
            ->with('fee:id,name,amount,due_date', 'parent:id,name,phone,email')
            ->whereHas('fee', fn($q) => $q->where('status', 'active'))
            ->get();

        return Inertia::render('school/Reports', [
            'fees' => $fees,
            'outstanding' => $outstanding,
        ]);
    }
}
