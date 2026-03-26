<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $fillable = [
        'name', 'address', 'phone', 'logo', 'status',
        'subscription_fee', 'subscription_status', 'subscription_start', 'subscription_end',
    ];

    protected $casts = [
        'subscription_fee' => 'decimal:2',
        'subscription_start' => 'date',
        'subscription_end' => 'date',
    ];

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function canteens()
    {
        return $this->hasMany(Canteen::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
}
