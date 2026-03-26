<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Topup;
use App\Models\Transaction;
use App\Services\BayarcashService;
use App\Services\ToyyibPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TopupController extends Controller
{
    public function index()
    {
        $students = auth()->user()->students()->with('school')->get();

        $bayarcash = new BayarcashService();
        $toyyibpay = new ToyyibPayService();

        return Inertia::render('parent/Topup', [
            'students' => $students,
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

    public function store(Request $request)
    {
        $minTopup = (float) Setting::get('min_topup', '1');
        $maxTopup = (float) Setting::get('max_topup', '500');
        $serviceFee = (float) Setting::get('topup_service_fee', '0.50');
        $feeWaiverMin = (float) Setting::get('topup_fee_waiver_min', '0');

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => "required|numeric|min:{$minTopup}|max:{$maxTopup}",
            'payment_method' => 'required|in:manual,bayarcash,toyyibpay',
        ]);

        $student = Student::where('id', $request->student_id)
            ->where('parent_id', auth()->id())
            ->firstOrFail();

        $method = $request->payment_method;
        $amount = (float) $request->amount;

        // Waive service fee if amount meets minimum threshold
        if ($feeWaiverMin > 0 && $amount >= $feeWaiverMin) {
            $serviceFee = 0;
        }

        $totalCharge = $amount + $serviceFee;

        // Manual top up — direct credit
        if ($method === 'manual') {
            return $this->processManualTopup($student, $amount, $serviceFee);
        }

        // FPX — create pending topup & redirect to gateway
        $orderNumber = 'EK-' . strtoupper(Str::random(8));

        $topup = Topup::create([
            'parent_id' => auth()->id(),
            'student_id' => $student->id,
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
                    'payment_channel' => 1, // FPX
                    'return_url' => url('/payment/bayarcash/return'),
                    'callback_url' => url('/payment/bayarcash/callback'),
                ]);

                $paymentUrl = $result['url'] ?? null;
                if (!$paymentUrl) {
                    throw new \Exception('No payment URL returned.');
                }

                return Inertia::location($paymentUrl);
            }

            if ($method === 'toyyibpay') {
                $service = new ToyyibPayService();
                $paymentUrl = $service->createBill([
                    'bill_name' => 'e-Kantin Top Up',
                    'bill_description' => "Wallet top up for {$student->name}",
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
            $topup->update(['status' => 'failed']);
            return back()->with('error', 'Payment failed: ' . $e->getMessage());
        }
    }

    public function history()
    {
        $studentIds = auth()->user()->students()->pluck('id');

        $topups = Topup::whereIn('student_id', $studentIds)
            ->with('student')
            ->latest()
            ->paginate(20);

        return Inertia::render('parent/TopupHistory', [
            'topups' => $topups,
        ]);
    }

    private function processManualTopup(Student $student, float $amount, float $serviceFee)
    {
        return DB::transaction(function () use ($student, $amount, $serviceFee) {
            $student = Student::lockForUpdate()->findOrFail($student->id);

            $balanceBefore = $student->wallet_balance;
            $student->wallet_balance += $amount;
            $student->save();

            $topup = Topup::create([
                'parent_id' => auth()->id(),
                'student_id' => $student->id,
                'amount' => $amount,
                'service_fee' => $serviceFee,
                'payment_method' => 'manual',
                'status' => 'success',
            ]);

            Transaction::create([
                'student_id' => $student->id,
                'type' => 'topup',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $student->wallet_balance,
                'description' => 'Manual Top Up',
                'reference_id' => "TU-{$topup->id}",
                'created_at' => now(),
            ]);

            return back()->with('success', 'Topped up RM' . number_format($amount, 2) . ' to ' . $student->name);
        });
    }
}
