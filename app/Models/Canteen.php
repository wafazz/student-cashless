<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Canteen extends Model
{
    protected $fillable = [
        'school_id', 'operator_id', 'name', 'type', 'status',
        'contract_fee', 'contract_status', 'contract_start', 'contract_end', 'contract_notes',
        'bank_name', 'bank_account', 'bank_holder',
    ];

    protected $casts = [
        'contract_fee' => 'decimal:2',
        'contract_start' => 'date',
        'contract_end' => 'date',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function menuItems()
    {
        return $this->hasMany(MenuItem::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function staff()
    {
        return $this->hasMany(CanteenStaff::class);
    }
}
