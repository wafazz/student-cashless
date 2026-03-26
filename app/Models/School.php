<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $fillable = [
        'name', 'address', 'phone', 'email', 'logo', 'status',
        'subscription_fee', 'subscription_status', 'subscription_start', 'subscription_end', 'package_id',
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

    public function package()
    {
        return $this->belongsTo(SubscriptionPackage::class, 'package_id');
    }

    public function classes()
    {
        return $this->hasMany(SchoolClass::class);
    }

    public function schoolFees()
    {
        return $this->hasMany(SchoolFee::class);
    }

    public function canteens()
    {
        return $this->hasMany(Canteen::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function pibgFees()
    {
        return $this->hasMany(PibgFee::class);
    }

    public function schoolUsers()
    {
        return $this->hasMany(User::class)->where('role', 'school');
    }
}
