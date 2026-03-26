<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\PibgFee;
use App\Models\PibgFeeParent;
use App\Models\Student;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $schoolId = auth()->user()->school_id;

        $totalStudents = Student::where('school_id', $schoolId)->where('status', 'active')->count();
        $totalParents = Student::where('school_id', $schoolId)->distinct()->count('parent_id');
        $activeFees = PibgFee::where('school_id', $schoolId)->where('status', 'active')->count();

        $totalExpected = PibgFeeParent::where('school_id', $schoolId)
            ->whereHas('fee', fn($q) => $q->where('status', 'active'))
            ->count();
        $totalPaid = PibgFeeParent::where('school_id', $schoolId)
            ->where('status', 'paid')
            ->whereHas('fee', fn($q) => $q->where('status', 'active'))
            ->count();

        $totalCollected = PibgFeeParent::where('school_id', $schoolId)
            ->where('status', 'paid')->sum('amount_paid');
        $totalOutstanding = PibgFeeParent::where('school_id', $schoolId)
            ->where('status', 'unpaid')
            ->get()->sum(fn($p) => $p->fee->amount ?? 0);

        $recentPayments = PibgFeeParent::where('school_id', $schoolId)
            ->where('status', 'paid')
            ->with('fee', 'parent')
            ->latest('paid_at')
            ->take(10)
            ->get();

        return Inertia::render('school/Dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'totalParents' => $totalParents,
                'activeFees' => $activeFees,
                'totalExpected' => $totalExpected,
                'totalPaid' => $totalPaid,
                'totalCollected' => round($totalCollected, 2),
                'totalOutstanding' => round($totalOutstanding, 2),
            ],
            'recentPayments' => $recentPayments,
        ]);
    }
}
