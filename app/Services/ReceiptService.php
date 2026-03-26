<?php

namespace App\Services;

use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptService
{
    public static function generateTopupReceipt(Transaction $transaction): \Barryvdh\DomPDF\PDF
    {
        $transaction->load('student.school');

        return Pdf::loadView('receipts.topup', [
            'transaction' => $transaction,
        ])->setPaper('a5');
    }

    public static function generatePurchaseReceipt(Transaction $transaction): \Barryvdh\DomPDF\PDF
    {
        $transaction->load('student.school', 'canteen', 'operator');

        return Pdf::loadView('receipts.purchase', [
            'transaction' => $transaction,
        ])->setPaper('a5');
    }
}
