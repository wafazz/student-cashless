<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    protected $fillable = [
        'entity_type', 'entity_id', 'entity_name', 'amount', 'platform_fee', 'net_amount',
        'bank_name', 'bank_account', 'bank_holder',
        'status', 'requested_at', 'approved_at', 'paid_at',
        'payment_reference', 'admin_notes', 'approved_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
