<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Student extends Model
{
    protected $fillable = [
        'parent_id', 'school_id', 'name', 'ic_number', 'class_name',
        'wallet_uuid', 'wallet_balance', 'daily_limit', 'daily_spent',
        'photo', 'status',
    ];

    protected $casts = [
        'wallet_balance' => 'decimal:2',
        'daily_limit' => 'decimal:2',
        'daily_spent' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::creating(function (Student $student) {
            if (empty($student->wallet_uuid)) {
                $student->wallet_uuid = Str::uuid()->toString();
            }
        });
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function topups()
    {
        return $this->hasMany(Topup::class);
    }
}
