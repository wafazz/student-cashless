<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/Settings', [
            'settings' => [
                'min_topup' => Setting::get('min_topup', '1'),
                'max_topup' => Setting::get('max_topup', '500'),
                'default_daily_limit' => Setting::get('default_daily_limit', '10'),
                'topup_service_fee' => Setting::get('topup_service_fee', '0.50'),
                'topup_fee_waiver_min' => Setting::get('topup_fee_waiver_min', '0'),
                'bayarcash_portal_key' => Setting::get('bayarcash_portal_key', ''),
                'bayarcash_token' => Setting::get('bayarcash_token', ''),
                'bayarcash_secret' => Setting::get('bayarcash_secret', ''),
                'bayarcash_sandbox' => Setting::get('bayarcash_sandbox', '1'),
                'toyyibpay_key' => Setting::get('toyyibpay_key', ''),
                'toyyibpay_category' => Setting::get('toyyibpay_category', ''),
                'toyyibpay_sandbox' => Setting::get('toyyibpay_sandbox', '1'),
                'withdrawal_fee_store' => Setting::get('withdrawal_fee_store', '3'),
                'withdrawal_fee_school' => Setting::get('withdrawal_fee_school', '2'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'min_topup' => 'nullable|numeric|min:1',
            'max_topup' => 'nullable|numeric|min:1',
            'default_daily_limit' => 'nullable|numeric|min:0',
            'topup_service_fee' => 'nullable|numeric|min:0',
            'topup_fee_waiver_min' => 'nullable|numeric|min:0',
            'withdrawal_fee_store' => 'nullable|numeric|min:0|max:50',
            'withdrawal_fee_school' => 'nullable|numeric|min:0|max:50',
        ]);

        $keys = [
            'min_topup', 'max_topup', 'default_daily_limit', 'topup_service_fee', 'topup_fee_waiver_min',
            'bayarcash_portal_key', 'bayarcash_token', 'bayarcash_secret', 'bayarcash_sandbox',
            'toyyibpay_key', 'toyyibpay_category', 'toyyibpay_sandbox',
            'withdrawal_fee_store', 'withdrawal_fee_school',
        ];

        foreach ($keys as $key) {
            if ($request->has($key)) {
                Setting::set($key, $request->input($key));
            }
        }

        return back()->with('success', 'Settings saved.');
    }
}
