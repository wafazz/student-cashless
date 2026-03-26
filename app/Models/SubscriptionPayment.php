<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPayment extends Model
{
    protected $fillable = [
        'school_id', 'package_id', 'amount', 'receipt_path', 'notes',
        'status', 'admin_notes', 'approved_by', 'approved_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function package()
    {
        return $this->belongsTo(SubscriptionPackage::class, 'package_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
