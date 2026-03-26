<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Topup;
use App\Models\Transaction;
use App\Services\BayarcashService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    // Bayarcash callback (POST, server-to-server)
    public function bayarcashCallback(Request $request)
    {
        Log::info('Bayarcash callback', $request->all());

        $service = new BayarcashService();

        if (!$service->verifyCallback($request->all())) {
            Log::warning('Bayarcash callback checksum mismatch');
            return response('Invalid checksum', 400);
        }

        $orderNumber = $request->input('order_number');
        $statusId = $request->input('status_id');
        $transactionId = $request->input('transaction_id');

        $topup = Topup::where('gateway_ref', $orderNumber)->first();

        if (!$topup) {
            Log::warning('Bayarcash callback: topup not found', ['order_number' => $orderNumber]);
            return response('Not found', 404);
        }

        if ($topup->status === 'success') {
            return response('Already processed', 200);
        }

        // Bayarcash status: 3 = Success
        if ((int)$statusId === 3) {
            $this->creditWallet($topup, $transactionId);
        } else {
            $topup->update(['status' => 'failed']);
        }

        return response('OK', 200);
    }

    // Bayarcash return (cross-site POST — withoutMiddleware('web'))
    public function bayarcashReturn(Request $request)
    {
        $orderNumber = $request->input('order_number');
        $topup = Topup::where('gateway_ref', $orderNumber)->first();

        if ($topup && $topup->status === 'success') {
            return redirect('/parent/topup/history')->with('success', 'Payment successful! Wallet has been topped up.');
        }

        return redirect('/parent/topup/history')->with('error', 'Payment was not completed. Please try again.');
    }

    // ToyyibPay callback (POST, server-to-server)
    public function toyyibpayCallback(Request $request)
    {
        Log::info('ToyyibPay callback', $request->all());

        $refNo = $request->input('billexternalreferenceno');
        $status = $request->input('status_id');
        $transactionId = $request->input('transaction_id');

        $topup = Topup::where('gateway_ref', $refNo)->first();

        if (!$topup) {
            Log::warning('ToyyibPay callback: topup not found', ['ref' => $refNo]);
            return response('Not found', 404);
        }

        if ($topup->status === 'success') {
            return response('Already processed', 200);
        }

        // ToyyibPay status: 1 = Success
        if ((int)$status === 1) {
            $this->creditWallet($topup, $transactionId);
        } else {
            $topup->update(['status' => 'failed']);
        }

        return response('OK', 200);
    }

    // ToyyibPay return (GET, user-facing)
    public function toyyibpayReturn(Request $request)
    {
        $refNo = $request->input('billexternalreferenceno');
        $status = $request->input('status_id');

        if ((int)$status === 1) {
            return redirect('/parent/topup/history')->with('success', 'Payment successful! Wallet has been topped up.');
        }

        return redirect('/parent/topup/history')->with('error', 'Payment was not completed. Please try again.');
    }

    private function creditWallet(Topup $topup, ?string $transactionId): void
    {
        DB::transaction(function () use ($topup, $transactionId) {
            $student = Student::lockForUpdate()->findOrFail($topup->student_id);

            $balanceBefore = $student->wallet_balance;
            $student->wallet_balance += $topup->amount;
            $student->save();

            $topup->update([
                'status' => 'success',
                'gateway_ref' => $topup->gateway_ref, // keep original order number
            ]);

            Transaction::create([
                'student_id' => $student->id,
                'type' => 'topup',
                'amount' => $topup->amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $student->wallet_balance,
                'description' => 'FPX Top Up (' . ucfirst($topup->gateway) . ')',
                'reference_id' => $transactionId ?? 'TU-' . $topup->id,
                'created_at' => now(),
            ]);
        });
    }
}
