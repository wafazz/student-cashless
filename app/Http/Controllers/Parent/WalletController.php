<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Topup;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BayarcashService;
use App\Services\ToyyibPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $students = $user->students()->with('school')->get();

        return Inertia::render('parent/Wallet', [
            'user' => $user,
            'students' => $students,
        ]);
    }

    public function topup()
    {
        $user = auth()->user();
        $bayarcash = new BayarcashService();
        $toyyibpay = new ToyyibPayService();

        return Inertia::render('parent/WalletTopup', [
            'walletBalance' => (float) $user->wallet_balance,
            'gateways' => [
                'bayarcash' => $bayarcash->isConfigured(),
                'toyyibpay' => $toyyibpay->isConfigured(),
            ],
            'minTopup' => (float) Setting::get('min_topup', '1'),
            'maxTopup' => (float) Setting::get('max_topup', '500'),
            'serviceFee' => (float) Setting::get('topup_service_fee', '0.50'),
            'feeWaiverMin' => (float) Setting::get('topup_fee_waiver_min', '0'),
        ]);
    }

    public function topupStore(Request $request)
    {
        $minTopup = (float) Setting::get('min_topup', '1');
        $maxTopup = (float) Setting::get('max_topup', '500');
        $serviceFee = (float) Setting::get('topup_service_fee', '0.50');
        $feeWaiverMin = (float) Setting::get('topup_fee_waiver_min', '0');

        $request->validate([
            'amount' => "required|numeric|min:{$minTopup}|max:{$maxTopup}",
            'payment_method' => 'required|in:manual,bayarcash,toyyibpay',
        ]);

        $amount = (float) $request->amount;
        $method = $request->payment_method;

        if ($feeWaiverMin > 0 && $amount >= $feeWaiverMin) {
            $serviceFee = 0;
        }

        $totalCharge = $amount + $serviceFee;

        if ($method === 'manual') {
            return DB::transaction(function () use ($amount, $serviceFee) {
                $user = User::lockForUpdate()->findOrFail(auth()->id());
                $balanceBefore = $user->wallet_balance;
                $user->wallet_balance += $amount;
                $user->save();

                $topup = Topup::create([
                    'parent_id' => $user->id,
                    'student_id' => null,
                    'amount' => $amount,
                    'service_fee' => $serviceFee,
                    'payment_method' => 'manual',
                    'status' => 'success',
                ]);

                Transaction::create([
                    'parent_id' => $user->id,
                    'type' => 'topup',
                    'amount' => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $user->wallet_balance,
                    'description' => 'General Wallet Top Up',
                    'reference_id' => "GW-{$topup->id}",
                    'created_at' => now(),
                ]);

                return back()->with('success', 'Topped up RM' . number_format($amount, 2) . ' to your wallet.');
            });
        }

        // FPX
        $orderNumber = 'GW-' . strtoupper(Str::random(8));

        Topup::create([
            'parent_id' => auth()->id(),
            'student_id' => null,
            'amount' => $amount,
            'service_fee' => $serviceFee,
            'payment_method' => 'fpx',
            'gateway' => $method,
            'gateway_ref' => $orderNumber,
            'status' => 'pending',
        ]);

        $user = auth()->user();

        try {
            if ($method === 'bayarcash') {
                $service = new BayarcashService();
                $result = $service->createPaymentIntent([
                    'order_number' => $orderNumber,
                    'amount' => $totalCharge,
                    'buyer_name' => $user->name,
                    'buyer_email' => $user->email,
                    'buyer_phone' => $user->phone ?? '',
                    'payment_channel' => 1,
                    'return_url' => url('/payment/bayarcash/return'),
                    'callback_url' => url('/payment/bayarcash/callback'),
                ]);
                return Inertia::location($result['url'] ?? '');
            }

            if ($method === 'toyyibpay') {
                $service = new ToyyibPayService();
                $paymentUrl = $service->createBill([
                    'bill_name' => 'e-Kantin General Wallet Top Up',
                    'bill_description' => "Wallet top up for {$user->name}",
                    'amount' => $totalCharge,
                    'reference' => $orderNumber,
                    'buyer_name' => $user->name,
                    'buyer_email' => $user->email,
                    'buyer_phone' => $user->phone ?? '',
                    'return_url' => url('/payment/toyyibpay/return'),
                    'callback_url' => url('/payment/toyyibpay/callback'),
                ]);
                return Inertia::location($paymentUrl);
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Payment failed: ' . $e->getMessage());
        }
    }

    public function transfer(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:1',
        ]);

        $student = Student::where('id', $request->student_id)
            ->where('parent_id', auth()->id())
            ->firstOrFail();

        return DB::transaction(function () use ($request, $student) {
            $user = User::lockForUpdate()->findOrFail(auth()->id());
            $amount = (float) $request->amount;

            if ($user->wallet_balance < $amount) {
                return back()->with('error', 'Insufficient wallet balance. Current: RM' . number_format($user->wallet_balance, 2));
            }

            $student = Student::lockForUpdate()->findOrFail($student->id);

            // Deduct from parent
            $parentBefore = $user->wallet_balance;
            $user->wallet_balance -= $amount;
            $user->save();

            // Credit to child
            $childBefore = $student->wallet_balance;
            $student->wallet_balance += $amount;
            $student->save();

            // Parent transaction (debit)
            Transaction::create([
                'parent_id' => $user->id,
                'student_id' => $student->id,
                'type' => 'purchase',
                'amount' => $amount,
                'balance_before' => $parentBefore,
                'balance_after' => $user->wallet_balance,
                'description' => "Transfer to {$student->name}",
                'reference_id' => 'TRF-' . now()->timestamp,
                'created_at' => now(),
            ]);

            // Child transaction (credit)
            Transaction::create([
                'student_id' => $student->id,
                'type' => 'topup',
                'amount' => $amount,
                'balance_before' => $childBefore,
                'balance_after' => $student->wallet_balance,
                'description' => 'Transfer from parent wallet',
                'reference_id' => 'TRF-' . now()->timestamp,
                'created_at' => now(),
            ]);

            return back()->with('success', 'Transferred RM' . number_format($amount, 2) . ' to ' . $student->name);
        });
    }

    public function qr()
    {
        $user = auth()->user();

        return Inertia::render('parent/WalletQr', [
            'user' => $user,
        ]);
    }
}
