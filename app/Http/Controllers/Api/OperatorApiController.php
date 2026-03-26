<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CanteenStaff;
use App\Models\MenuItem;
use App\Models\Student;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\LowBalanceNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class OperatorApiController extends Controller
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

        if (!in_array($user->role, ['operator', 'cashier'])) {
            return response()->json(['message' => 'Access denied. Operator/cashier only.'], 403);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Account deactivated.'], 403);
        }

        $canteen = $user->getCanteenForWork();

        // Check school subscription
        if ($canteen && $canteen->school && $canteen->school->subscription_status === 'inactive') {
            return response()->json(['message' => 'School subscription expired. Contact admin.'], 403);
        }

        $token = $user->createToken('flutter-app')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'canteen' => $canteen ? [
                'id' => $canteen->id,
                'name' => $canteen->name,
                'type' => $canteen->type,
                'school' => $canteen->school?->name,
                'school_id' => $canteen->school_id,
            ] : null,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $canteen = $user->getCanteenForWork();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
            'canteen' => $canteen ? [
                'id' => $canteen->id,
                'name' => $canteen->name,
                'type' => $canteen->type,
                'school' => $canteen->school?->name,
                'school_id' => $canteen->school_id,
                'status' => $canteen->status,
                'contract_status' => $canteen->contract_status,
            ] : null,
        ]);
    }

    // ─── DASHBOARD ────────────────────────────────────

    public function dashboard(Request $request)
    {
        $canteen = $request->user()->getCanteenForWork();

        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $today = now()->toDateString();

        $todayPurchases = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', $today)
            ->get();

        $todayRefunds = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'refund')
            ->whereDate('created_at', $today)
            ->sum('amount');

        $recentTransactions = Transaction::where('canteen_id', $canteen->id)
            ->with('student:id,name,class_name')
            ->latest('created_at')
            ->take(20)
            ->get()
            ->map(function ($tx) {
                $name = $tx->student?->name;
                $class = $tx->student?->class_name;
                if (!$name && $tx->parent_id) {
                    $parent = User::find($tx->parent_id);
                    $name = $parent ? $parent->name . ' (Parent)' : 'Unknown';
                    $class = 'Parent';
                }
                return [
                    'id' => $tx->id,
                    'student_name' => $name ?: 'Unknown',
                    'student_class' => $class,
                    'type' => $tx->type,
                    'amount' => $tx->amount,
                    'description' => $tx->description,
                    'created_at' => $tx->created_at,
                ];
            });

        return response()->json([
            'canteen' => [
                'id' => $canteen->id,
                'name' => $canteen->name,
                'type' => $canteen->type,
                'school' => $canteen->school?->name,
            ],
            'today' => [
                'sales' => round($todayPurchases->sum('amount'), 2),
                'transactions' => $todayPurchases->count(),
                'refunds' => round($todayRefunds, 2),
            ],
            'recent_transactions' => $recentTransactions,
        ]);
    }

    // ─── SCAN & CHARGE ────────────────────────────────

    public function lookup(Request $request)
    {
        $uuid = trim($request->input('wallet_uuid', ''));

        if (preg_match('/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i', $uuid, $matches)) {
            $uuid = $matches[0];
        }

        if (!$uuid || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid)) {
            return response()->json(['message' => 'Invalid QR code format.'], 422);
        }

        // Try student first
        $student = Student::where('wallet_uuid', $uuid)->where('status', 'active')->with('school:id,name')->first();

        if ($student) {
            return response()->json([
                'type' => 'student',
                'id' => $student->id,
                'name' => $student->name,
                'class_name' => $student->class_name,
                'school' => $student->school?->name,
                'wallet_balance' => (float) $student->wallet_balance,
                'daily_limit' => $student->daily_limit ? (float) $student->daily_limit : null,
                'daily_spent' => (float) $student->daily_spent,
                'photo' => $student->photo ? asset('storage/' . $student->photo) : null,
            ]);
        }

        // Try parent
        $parent = User::where('wallet_uuid', $uuid)->where('role', 'parent')->where('status', 'active')->first();

        if ($parent) {
            return response()->json([
                'type' => 'parent',
                'id' => $parent->id,
                'name' => $parent->name,
                'class_name' => 'Parent',
                'school' => 'General Wallet',
                'wallet_balance' => (float) $parent->wallet_balance,
                'daily_limit' => null,
                'daily_spent' => 0,
                'photo' => null,
            ]);
        }

        return response()->json(['message' => 'Account not found or inactive.'], 404);
    }

    public function charge(Request $request)
    {
        $request->validate([
            'student_id' => 'nullable|exists:students,id',
            'parent_id' => 'nullable|exists:users,id',
            'amount' => 'required|numeric|min:0.10',
            'description' => 'nullable|string|max:255',
        ]);

        if (!$request->student_id && !$request->parent_id) {
            return response()->json(['message' => 'No account specified.'], 422);
        }

        $canteen = $request->user()->getCanteenForWork();
        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $amount = round($request->amount, 2);

        // Parent wallet charge
        if ($request->parent_id) {
            return DB::transaction(function () use ($request, $canteen, $amount) {
                $parent = User::lockForUpdate()->findOrFail($request->parent_id);

                if ($parent->wallet_balance < $amount) {
                    return response()->json(['message' => 'Insufficient balance.', 'balance' => (float) $parent->wallet_balance], 422);
                }

                $balanceBefore = $parent->wallet_balance;
                $parent->wallet_balance -= $amount;
                $parent->save();

                $tx = Transaction::create([
                    'parent_id' => $parent->id,
                    'canteen_id' => $canteen->id,
                    'operator_id' => auth()->id(),
                    'type' => 'purchase',
                    'amount' => $amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $parent->wallet_balance,
                    'description' => $request->description,
                    'reference_id' => 'PW-' . now()->timestamp,
                    'created_at' => now(),
                ]);

                return response()->json([
                    'message' => "Charged RM" . number_format($amount, 2) . " to {$parent->name} (Parent).",
                    'transaction' => [
                        'id' => $tx->id,
                        'amount' => $amount,
                        'balance_after' => (float) $parent->wallet_balance,
                        'student_name' => $parent->name . ' (Parent)',
                        'description' => $request->description,
                    ],
                ]);
            });
        }

        // Student wallet charge
        return DB::transaction(function () use ($request, $canteen, $amount) {
            $student = Student::lockForUpdate()->findOrFail($request->student_id);

            if ($student->status !== 'active') {
                return response()->json(['message' => 'Student account is inactive.'], 422);
            }

            if ($student->wallet_balance < $amount) {
                return response()->json([
                    'message' => 'Insufficient balance.',
                    'balance' => (float) $student->wallet_balance,
                ], 422);
            }

            if ($student->daily_limit !== null && ($student->daily_spent + $amount) > $student->daily_limit) {
                $remaining = max(0, $student->daily_limit - $student->daily_spent);
                return response()->json([
                    'message' => 'Daily limit exceeded.',
                    'daily_limit' => (float) $student->daily_limit,
                    'daily_spent' => (float) $student->daily_spent,
                    'remaining' => round($remaining, 2),
                ], 422);
            }

            $balanceBefore = $student->wallet_balance;
            $student->wallet_balance -= $amount;
            $student->daily_spent += $amount;
            $student->save();

            $tx = Transaction::create([
                'student_id' => $student->id,
                'canteen_id' => $canteen->id,
                'operator_id' => auth()->id(),
                'type' => 'purchase',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $student->wallet_balance,
                'description' => $request->description,
                'created_at' => now(),
            ]);

            if ($student->wallet_balance < 5 && $student->parent) {
                $student->parent->notify(new LowBalanceNotification($student));
            }

            return response()->json([
                'message' => "Charged RM" . number_format($amount, 2) . " to {$student->name}.",
                'transaction' => [
                    'id' => $tx->id,
                    'amount' => $amount,
                    'balance_after' => (float) $student->wallet_balance,
                    'student_name' => $student->name,
                    'description' => $request->description,
                ],
            ]);
        });
    }

    // ─── SALES ────────────────────────────────────────

    public function sales(Request $request)
    {
        $canteen = $request->user()->getCanteenForWork();
        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $date = $request->input('date', now()->toDateString());

        $transactions = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', $date)
            ->with('student:id,name,class_name')
            ->latest('created_at')
            ->paginate(30);

        $summary = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', $date);

        return response()->json([
            'date' => $date,
            'canteen' => [
                'id' => $canteen->id,
                'name' => $canteen->name,
                'type' => $canteen->type,
            ],
            'summary' => [
                'total' => round($summary->sum('amount'), 2),
                'count' => $summary->count(),
            ],
            'transactions' => $transactions,
        ]);
    }

    // ─── MENU ─────────────────────────────────────────

    public function menuIndex(Request $request)
    {
        $canteen = $request->user()->getCanteenForWork();
        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $menuItems = $canteen->menuItems()->orderBy('category')->orderBy('name')->get();

        return response()->json([
            'canteen' => [
                'id' => $canteen->id,
                'name' => $canteen->name,
                'type' => $canteen->type,
            ],
            'menu_items' => $menuItems,
        ]);
    }

    public function menuStore(Request $request)
    {
        $canteen = $request->user()->getCanteenForWork();
        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0.10',
            'category' => 'nullable|string|max:100',
        ]);

        $item = $canteen->menuItems()->create($request->only(['name', 'price', 'category']));

        $label = $canteen->type === 'koperasi' ? 'Product' : 'Menu item';
        return response()->json(['message' => "{$label} added.", 'menu_item' => $item], 201);
    }

    public function menuUpdate(Request $request, MenuItem $menuItem)
    {
        $canteen = $request->user()->getCanteenForWork();
        if (!$canteen || $menuItem->canteen_id !== $canteen->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0.10',
            'category' => 'nullable|string|max:100',
            'is_available' => 'boolean',
        ]);

        $menuItem->update($request->only(['name', 'price', 'category', 'is_available']));

        $label = $canteen->type === 'koperasi' ? 'Product' : 'Menu item';
        return response()->json(['message' => "{$label} updated.", 'menu_item' => $menuItem]);
    }

    public function menuDestroy(Request $request, MenuItem $menuItem)
    {
        $canteen = $request->user()->getCanteenForWork();
        if (!$canteen || $menuItem->canteen_id !== $canteen->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $label = $canteen->type === 'koperasi' ? 'Product' : 'Menu item';
        $menuItem->delete();

        return response()->json(['message' => "{$label} deleted."]);
    }

    // ─── REFUND ───────────────────────────────────────

    public function refundList(Request $request)
    {
        $canteen = $request->user()->getCanteenForWork();
        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $charges = Transaction::where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->whereDate('created_at', now()->toDateString())
            ->with('student:id,name,class_name')
            ->latest('created_at')
            ->take(30)
            ->get()
            ->map(function ($tx) {
                $refunded = Transaction::where('reference_id', "REF-{$tx->id}")
                    ->where('type', 'refund')
                    ->exists();

                $name = $tx->student?->name;
                $class = $tx->student?->class_name;
                if (!$name && $tx->parent_id) {
                    $parent = User::find($tx->parent_id);
                    $name = $parent ? $parent->name . ' (Parent)' : 'Unknown';
                    $class = 'Parent';
                }

                return [
                    'id' => $tx->id,
                    'student_name' => $name ?: 'Unknown',
                    'student_class' => $class,
                    'amount' => $tx->amount,
                    'description' => $tx->description,
                    'created_at' => $tx->created_at,
                    'already_refunded' => $refunded,
                ];
            });

        return response()->json([
            'canteen' => [
                'id' => $canteen->id,
                'name' => $canteen->name,
                'type' => $canteen->type,
            ],
            'charges' => $charges,
        ]);
    }

    public function refundStore(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'reason' => 'nullable|string|max:255',
        ]);

        $canteen = $request->user()->getCanteenForWork();
        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $originalTx = Transaction::where('id', $request->transaction_id)
            ->where('canteen_id', $canteen->id)
            ->where('type', 'purchase')
            ->first();

        if (!$originalTx) {
            return response()->json(['message' => 'Transaction not found.'], 404);
        }

        if (!$originalTx->created_at->isToday()) {
            return response()->json(['message' => 'Can only refund today\'s transactions.'], 422);
        }

        $alreadyRefunded = Transaction::where('reference_id', "REF-{$originalTx->id}")
            ->where('type', 'refund')
            ->exists();

        if ($alreadyRefunded) {
            return response()->json(['message' => 'Already refunded.'], 422);
        }

        // Parent wallet refund
        if ($originalTx->parent_id && !$originalTx->student_id) {
            return DB::transaction(function () use ($originalTx, $request) {
                $parent = User::lockForUpdate()->findOrFail($originalTx->parent_id);
                $balanceBefore = $parent->wallet_balance;
                $parent->wallet_balance += $originalTx->amount;
                $parent->save();

                Transaction::create([
                    'parent_id' => $parent->id,
                    'canteen_id' => $originalTx->canteen_id,
                    'operator_id' => auth()->id(),
                    'type' => 'refund',
                    'amount' => $originalTx->amount,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $parent->wallet_balance,
                    'description' => 'Refund: ' . ($request->reason ?: $originalTx->description),
                    'reference_id' => "REF-{$originalTx->id}",
                    'created_at' => now(),
                ]);

                return response()->json([
                    'message' => "Refunded RM" . number_format($originalTx->amount, 2) . " to {$parent->name} (Parent).",
                    'balance_after' => (float) $parent->wallet_balance,
                ]);
            });
        }

        // Student wallet refund
        return DB::transaction(function () use ($originalTx, $request) {
            $student = Student::lockForUpdate()->findOrFail($originalTx->student_id);

            $balanceBefore = $student->wallet_balance;
            $student->wallet_balance += $originalTx->amount;
            $student->daily_spent = max(0, $student->daily_spent - $originalTx->amount);
            $student->save();

            Transaction::create([
                'student_id' => $student->id,
                'canteen_id' => $originalTx->canteen_id,
                'operator_id' => auth()->id(),
                'type' => 'refund',
                'amount' => $originalTx->amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $student->wallet_balance,
                'description' => 'Refund: ' . ($request->reason ?: $originalTx->description),
                'reference_id' => "REF-{$originalTx->id}",
                'created_at' => now(),
            ]);

            return response()->json([
                'message' => "Refunded RM" . number_format($originalTx->amount, 2) . " to {$student->name}.",
                'balance_after' => (float) $student->wallet_balance,
            ]);
        });
    }

    // ─── STAFF (owner only) ───────────────────────────

    public function staffIndex(Request $request)
    {
        if ($request->user()->role !== 'operator') {
            return response()->json(['message' => 'Owner access only.'], 403);
        }

        $canteen = $request->user()->canteen;
        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $staff = CanteenStaff::where('canteen_id', $canteen->id)
            ->with('user:id,name,email,phone,status')
            ->latest()
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->user->name,
                'email' => $s->user->email,
                'phone' => $s->user->phone,
                'position' => $s->position,
                'status' => $s->status,
            ]);

        return response()->json([
            'canteen' => [
                'id' => $canteen->id,
                'name' => $canteen->name,
                'type' => $canteen->type,
            ],
            'staff' => $staff,
        ]);
    }

    public function staffStore(Request $request)
    {
        if ($request->user()->role !== 'operator') {
            return response()->json(['message' => 'Owner access only.'], 403);
        }

        $canteen = $request->user()->canteen;
        if (!$canteen) {
            return response()->json(['message' => 'No store assigned.'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'position' => 'required|in:cashier,manager',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => $request->password,
            'role' => 'cashier',
        ]);

        CanteenStaff::create([
            'canteen_id' => $canteen->id,
            'user_id' => $user->id,
            'position' => $request->position,
        ]);

        return response()->json(['message' => 'Staff added.'], 201);
    }

    public function staffUpdate(Request $request, CanteenStaff $staff)
    {
        if ($request->user()->role !== 'operator') {
            return response()->json(['message' => 'Owner access only.'], 403);
        }

        $canteen = $request->user()->canteen;
        if (!$canteen || $staff->canteen_id !== $canteen->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->user_id,
            'phone' => 'nullable|string|max:20',
            'position' => 'required|in:cashier,manager',
            'status' => 'required|in:active,inactive',
        ]);

        $staff->user->update($request->only(['name', 'email', 'phone']));
        $staff->user->update(['status' => $request->status]);
        $staff->update(['position' => $request->position, 'status' => $request->status]);

        return response()->json(['message' => 'Staff updated.']);
    }
}
