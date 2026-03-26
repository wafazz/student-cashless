<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\PibgFeeParent;
use App\Models\School;
use App\Models\SchoolFeeStudent;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptController extends Controller
{
    public function pibgReceipt(PibgFeeParent $pibgFeeParent)
    {
        $schoolId = auth()->user()->school_id;
        if ($pibgFeeParent->school_id !== $schoolId) abort(403);
        if ($pibgFeeParent->status !== 'paid') abort(404);

        $pibgFeeParent->load('fee', 'parent');
        $school = School::findOrFail($schoolId);

        $pdf = Pdf::loadView('receipts.school-fee', [
            'school' => $school,
            'type' => 'PIBG Fee',
            'feeName' => $pibgFeeParent->fee->name,
            'academicYear' => $pibgFeeParent->fee->academic_year,
            'payerName' => $pibgFeeParent->parent->name,
            'payerType' => 'Parent',
            'studentName' => null,
            'amount' => $pibgFeeParent->amount_paid,
            'referenceId' => $pibgFeeParent->reference_id,
            'paidAt' => $pibgFeeParent->paid_at,
            'paymentMethod' => $pibgFeeParent->payment_method,
        ]);

        return $pdf->download("receipt-pibg-{$pibgFeeParent->id}.pdf");
    }

    public function schoolFeeReceipt(SchoolFeeStudent $schoolFeeStudent)
    {
        $schoolId = auth()->user()->school_id;
        if ($schoolFeeStudent->school_id !== $schoolId) abort(403);
        if ($schoolFeeStudent->status !== 'paid') abort(404);

        $schoolFeeStudent->load('fee', 'student.parent');
        $school = School::findOrFail($schoolId);

        $pdf = Pdf::loadView('receipts.school-fee', [
            'school' => $school,
            'type' => 'School Fee',
            'feeName' => $schoolFeeStudent->fee->name,
            'academicYear' => $schoolFeeStudent->fee->academic_year,
            'payerName' => $schoolFeeStudent->student->parent->name ?? '-',
            'payerType' => 'Parent',
            'studentName' => $schoolFeeStudent->student->name,
            'amount' => $schoolFeeStudent->amount_paid,
            'referenceId' => $schoolFeeStudent->reference_id,
            'paidAt' => $schoolFeeStudent->paid_at,
            'paymentMethod' => $schoolFeeStudent->payment_method,
        ]);

        return $pdf->download("receipt-fee-{$schoolFeeStudent->id}.pdf");
    }
}
