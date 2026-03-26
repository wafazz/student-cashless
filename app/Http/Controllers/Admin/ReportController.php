<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Canteen;
use App\Models\School;
use App\Models\Student;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->input('date_from', now()->startOfMonth()->toDateString());
        $dateTo = $request->input('date_to', now()->toDateString());

        // Sales by school
        $schoolSales = School::withCount(['students as total_students' => function ($q) {
            $q->where('status', 'active');
        }])->get()->map(function ($school) use ($dateFrom, $dateTo) {
            $studentIds = $school->students()->pluck('id');
            $sales = Transaction::whereIn('student_id', $studentIds)
                ->where('type', 'purchase')
                ->whereDate('created_at', '>=', $dateFrom)
                ->whereDate('created_at', '<=', $dateTo)
                ->sum('amount');
            $topups = Transaction::whereIn('student_id', $studentIds)
                ->where('type', 'topup')
                ->whereDate('created_at', '>=', $dateFrom)
                ->whereDate('created_at', '<=', $dateTo)
                ->sum('amount');
            $txCount = Transaction::whereIn('student_id', $studentIds)
                ->whereDate('created_at', '>=', $dateFrom)
                ->whereDate('created_at', '<=', $dateTo)
                ->count();

            return [
                'id' => $school->id,
                'name' => $school->name,
                'total_students' => $school->total_students,
                'sales' => round($sales, 2),
                'topups' => round($topups, 2),
                'transactions' => $txCount,
            ];
        });

        // Sales by canteen
        $canteenSales = Canteen::with('school', 'operator')->get()->map(function ($canteen) use ($dateFrom, $dateTo) {
            $sales = Transaction::where('canteen_id', $canteen->id)
                ->where('type', 'purchase')
                ->whereDate('created_at', '>=', $dateFrom)
                ->whereDate('created_at', '<=', $dateTo)
                ->sum('amount');
            $txCount = Transaction::where('canteen_id', $canteen->id)
                ->whereDate('created_at', '>=', $dateFrom)
                ->whereDate('created_at', '<=', $dateTo)
                ->count();

            return [
                'id' => $canteen->id,
                'name' => $canteen->name,
                'type' => $canteen->type,
                'school' => $canteen->school->name,
                'operator' => $canteen->operator->name,
                'sales' => round($sales, 2),
                'transactions' => $txCount,
            ];
        });

        // Top students by spending
        $topSpenders = Student::with('school')
            ->get()
            ->map(function ($student) use ($dateFrom, $dateTo) {
                $spent = Transaction::where('student_id', $student->id)
                    ->where('type', 'purchase')
                    ->whereDate('created_at', '>=', $dateFrom)
                    ->whereDate('created_at', '<=', $dateTo)
                    ->sum('amount');
                return [
                    'name' => $student->name,
                    'school' => $student->school->name,
                    'class' => $student->class_name,
                    'spent' => round($spent, 2),
                    'balance' => $student->wallet_balance,
                ];
            })
            ->sortByDesc('spent')
            ->take(10)
            ->values();

        // Totals
        $totalSales = Transaction::where('type', 'purchase')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->sum('amount');
        $totalTopups = Transaction::where('type', 'topup')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->sum('amount');
        $totalRefunds = Transaction::where('type', 'refund')
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo)
            ->sum('amount');

        return Inertia::render('admin/Reports', [
            'schoolSales' => $schoolSales,
            'canteenSales' => $canteenSales,
            'topSpenders' => $topSpenders,
            'totals' => [
                'sales' => round($totalSales, 2),
                'topups' => round($totalTopups, 2),
                'refunds' => round($totalRefunds, 2),
            ],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
