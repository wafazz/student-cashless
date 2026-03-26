<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Topup;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BayarcashService;
use App\Services\ToyyibPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ParentApiController extends Controller
{
    // ─── AUTH ──────────────────────────────────────────

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->role !== 'parent') {
            return response()->json(['message' => 'Access denied. Parent account only.'], 403);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Account deactivated.'], 403);
        }

        $token = $user->createToken('parent-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'parent',
        ]);

        $token = $user->createToken('parent-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }

    // ─── DASHBOARD ────────────────────────────────────

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $students = $user->students()->with('school:id,name')->get();

        $studentIds = $students->pluck('id');

        $allTx = Transaction::where(function ($q) use ($studentIds, $user) {
                $q->whereIn('student_id', $studentIds)
                  ->orWhere('parent_id', $user->id);
            })
            ->with('student:id,name', 'canteen:id,name,type')
            ->latest('created_at')
            ->take(15)
            ->get()
            ->map(fn($tx) => [
                'id' => $tx->id,
                'student_name' => $tx->student?->name ?: 'My Wallet',
                'canteen_name' => $tx->canteen?->name,
                'canteen_type' => $tx->canteen?->type,
                'type' => $tx->type,
                'amount' => $tx->amount,
                'description' => $tx->description,
                'balance_after' => $tx->balance_after,
                'created_at' => $tx->created_at,
            ]);

        return response()->json([
            'wallet' => [
                'balance' => (float) $user->wallet_balance,
                'uuid' => $user->wallet_uuid,
            ],
            'children' => $students->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'school' => $s->school?->name,
                'class_name' => $s->class_name,
                'wallet_balance' => (float) $s->wallet_balance,
                'daily_limit' => $s->daily_limit ? (float) $s->daily_limit : null,
                'daily_spent' => (float) $s->daily_spent,
                'wallet_uuid' => $s->wallet_uuid,
            ]),
            'total_balance' => round($students->sum('wallet_balance') + $user->wallet_balance, 2),
            'today_spent' => round($students->sum('daily_spent'), 2),
            'recent_transactions' => $allTx,
        ]);
    }

    // ─── CHILDREN ─────────────────────────────────────

    public function children(Request $request)
    {
        $students = $request->user()->students()->with('school:id,name')->get();

        return response()->json([
            'children' => $students->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'school' => $s->school?->name,
                'school_id' => $s->school_id,
                'class_name' => $s->class_name,
                'ic_number' => $s->ic_number,
                'wallet_balance' => (float) $s->wallet_balance,
                'wallet_uuid' => $s->wallet_uuid,
                'daily_limit' => $s->daily_limit ? (float) $s->daily_limit : null,
                'daily_spent' => (float) $s->daily_spent,
                'status' => $s->status,
            ]),
        ]);
    }

    public function childrenStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'school_id' => 'required|exists:schools,id',
            'ic_number' => 'nullable|string|max:20',
            'class_name' => 'nullable|string|max:100',
            'daily_limit' => 'nullable|numeric|min:0',
        ]);

        $student = $request->user()->students()->create($request->only([
            'name', 'school_id', 'ic_number', 'class_name', 'daily_limit',
        ]));

        return response()->json([
            'message' => 'Child added.',
            'child' => [
                'id' => $student->id,
                'name' => $student->name,
                'wallet_uuid' => $student->wallet_uuid,
            ],
        ], 201);
    }

    public function childrenUpdate(Request $request, Student $student)
    {
        if ($student->parent_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'school_id' => 'required|exists:schools,id',
            'ic_number' => 'nullable|string|max:20',
            'class_name' => 'nullable|string|max:100',
            'daily_limit' => 'nullable|numeric|min:0',
        ]);

        $student->update($request->only(['name', 'school_id', 'ic_number', 'class_name', 'daily_limit']));

        return response()->json(['message' => 'Child updated.']);
    }

    public function schools()
    {
        $schools = School::where('status', 'active')
            ->where('subscription_status', '!=', 'inactive')
            ->get(['id', 'name', 'address']);

        return response()->json(['schools' => $schools]);
    }

    // ─── TRANSACTIONS ─────────────────────────────────

    public function transactions(Request $request)
    {
        $user = $request->user();
        $studentIds = $user->students()->pluck('id');

        $query = Transaction::where(function ($q) use ($studentIds, $user) {
                $q->whereIn('student_id', $studentIds)
                  ->orWhere('parent_id', $user->id);
            })
            ->with('student:id,name', 'canteen:id,name,type');

        if ($request->filled('student_id')) {
            if ($request->student_id === 'wallet') {
                $query->where('parent_id', $user->id)->whereNull('student_id');
            } else {
                $query->where('student_id', $request->student_id);
            }
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('store_type')) {
            $query->whereHas('canteen', function ($q) use ($request) {
                $q->where('type', $request->store_type);
            });
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->latest('created_at')->paginate(20);

        return response()->json($transactions);
    }

    // ─── TOP UP ───────────────────────────────────────

    public function topupInfo(Request $request)
    {
        $students = $request->user()->students()->with('school:id,name')->get(['id', 'name', 'school_id', 'wallet_balance']);

        $bayarcash = new BayarcashService();
        $toyyibpay = new ToyyibPayService();

        return response()->json([
            'students' => $students,
            'gateways' => [
                'bayarcash' => $bayarcash->isConfigured(),
                'toyyibpay' => $toyyibpay->isConfigured(),
            ],
            'min_topup' => (float) Setting::get('min_topup', '1'),
            'max_topup' => (float) Setting::get('max_topup', '500'),
            'service_fee' => (float) Setting::get('topup_service_fee', '0.50'),
            'fee_waiver_min' => (float) Setting::get('topup_fee_waiver_min', '0'),
        ]);
    }

    public function topupStore(Request $request)
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
            ->where('parent_id', $request->user()->id)
            ->firstOrFail();

        $amount = (float) $request->amount;
        $method = $request->payment_method;

        if ($feeWaiverMin > 0 && $amount >= $feeWaiverMin) {
            $serviceFee = 0;
        }

        $totalCharge = $amount + $serviceFee;

        // Manual — instant credit
        if ($method === 'manual') {
            return DB::transaction(function () use ($request, $student, $amount, $serviceFee) {
                $student = Student::lockForUpdate()->findOrFail($student->id);
                $balanceBefore = $student->wallet_balance;
                $student->wallet_balance += $amount;
                $student->save();

                $topup = Topup::create([
                    'parent_id' => $request->user()->id,
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

                return response()->json([
                    'message' => "Topped up RM" . number_format($amount, 2) . " to {$student->name}.",
                    'balance' => (float) $student->wallet_balance,
                ]);
            });
        }

        // FPX — create pending & return payment URL
        $orderNumber = 'EK-' . strtoupper(Str::random(8));

        $topup = Topup::create([
            'parent_id' => $request->user()->id,
            'student_id' => $student->id,
            'amount' => $amount,
            'service_fee' => $serviceFee,
            'payment_method' => 'fpx',
            'gateway' => $method,
            'gateway_ref' => $orderNumber,
            'status' => 'pending',
        ]);

        $user = $request->user();

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

                return response()->json(['payment_url' => $result['url'] ?? null]);
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

                return response()->json(['payment_url' => $paymentUrl]);
            }
        } catch (\Exception $e) {
            $topup->update(['status' => 'failed']);
            return response()->json(['message' => 'Payment failed: ' . $e->getMessage()], 422);
        }
    }

    public function topupHistory(Request $request)
    {
        $studentIds = $request->user()->students()->pluck('id');

        $topups = Topup::whereIn('student_id', $studentIds)
            ->with('student:id,name')
            ->latest()
            ->paginate(20);

        return response()->json($topups);
    }

    // ─── GENERAL WALLET ────────────────────────────────

    public function walletInfo(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'balance' => (float) $user->wallet_balance,
            'uuid' => $user->wallet_uuid,
        ]);
    }

    public function walletTopup(Request $request)
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

        if ($method === 'manual') {
            return DB::transaction(function () use ($request, $amount, $serviceFee) {
                $user = User::lockForUpdate()->findOrFail($request->user()->id);
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

                return response()->json([
                    'message' => "Topped up RM" . number_format($amount, 2) . " to your wallet.",
                    'balance' => (float) $user->wallet_balance,
                ]);
            });
        }

        return response()->json(['message' => 'FPX for general wallet — use web app.'], 422);
    }

    public function walletTransfer(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric|min:1',
        ]);

        $student = Student::where('id', $request->student_id)
            ->where('parent_id', $request->user()->id)
            ->firstOrFail();

        return DB::transaction(function () use ($request, $student) {
            $user = User::lockForUpdate()->findOrFail($request->user()->id);
            $amount = (float) $request->amount;

            if ($user->wallet_balance < $amount) {
                return response()->json([
                    'message' => 'Insufficient wallet balance.',
                    'balance' => (float) $user->wallet_balance,
                ], 422);
            }

            $student = Student::lockForUpdate()->findOrFail($student->id);

            $parentBefore = $user->wallet_balance;
            $user->wallet_balance -= $amount;
            $user->save();

            $childBefore = $student->wallet_balance;
            $student->wallet_balance += $amount;
            $student->save();

            $ref = 'TRF-' . now()->timestamp;

            Transaction::create([
                'parent_id' => $user->id,
                'student_id' => $student->id,
                'type' => 'purchase',
                'amount' => $amount,
                'balance_before' => $parentBefore,
                'balance_after' => $user->wallet_balance,
                'description' => "Transfer to {$student->name}",
                'reference_id' => $ref,
                'created_at' => now(),
            ]);

            Transaction::create([
                'student_id' => $student->id,
                'type' => 'topup',
                'amount' => $amount,
                'balance_before' => $childBefore,
                'balance_after' => $student->wallet_balance,
                'description' => 'Transfer from parent wallet',
                'reference_id' => $ref,
                'created_at' => now(),
            ]);

            return response()->json([
                'message' => "Transferred RM" . number_format($amount, 2) . " to {$student->name}.",
                'wallet_balance' => (float) $user->wallet_balance,
                'child_balance' => (float) $student->wallet_balance,
            ]);
        });
    }

    // ─── NOTIFICATIONS ────────────────────────────────

    public function notifications(Request $request)
    {
        $notifications = $request->user()->notifications()->paginate(20);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markNotificationsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read.']);
    }

    // ─── PROFILE ──────────────────────────────────────

    public function profile(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }

    public function profileUpdate(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($request->only(['name', 'phone']));

        return response()->json(['message' => 'Profile updated.']);
    }

    public function passwordUpdate(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $request->user()->update(['password' => $request->password]);

        return response()->json(['message' => 'Password changed.']);
    }
}
