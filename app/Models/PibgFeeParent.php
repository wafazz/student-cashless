<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PibgFeeParent extends Model
{
    protected $fillable = [
        'pibg_fee_id', 'parent_id', 'school_id', 'amount_paid', 'status',
        'paid_at', 'payment_method', 'gateway', 'gateway_ref', 'reference_id',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function fee()
    {
        return $this->belongsTo(PibgFee::class, 'pibg_fee_id');
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
