<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;

class ParentController extends Controller
{
    public function index()
    {
        $parents = User::where('role', 'parent')
            ->withCount('students')
            ->with(['students' => function ($q) {
                $q->select('id', 'parent_id', 'name', 'wallet_balance');
            }])
            ->latest()
            ->get()
            ->map(function ($parent) {
                $parent->total_balance = $parent->students->sum('wallet_balance');
                return $parent;
            });

        return Inertia::render('admin/Parents', [
            'parents' => $parents,
        ]);
    }
}
