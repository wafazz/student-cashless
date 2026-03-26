<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'phone', 'password', 'role', 'school_id', 'status',
        'wallet_uuid', 'wallet_balance',
        'bank_name', 'bank_account', 'bank_holder',
    ];

    protected static function booted(): void
    {
        static::creating(function ($user) {
            if ($user->role === 'parent' && !$user->wallet_uuid) {
                $user->wallet_uuid = (string) Str::uuid();
            }
        });
    }

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'wallet_balance' => 'decimal:2',
        ];
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function pibgFeeAssignments()
    {
        return $this->hasMany(PibgFeeParent::class, 'parent_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'parent_id');
    }

    public function canteen()
    {
        return $this->hasOne(Canteen::class, 'operator_id');
    }

    public function staffAssignment()
    {
        return $this->hasOne(CanteenStaff::class);
    }

    public function getCanteenForWork()
    {
        if ($this->role === 'operator') {
            return $this->canteen;
        }
        if ($this->role === 'cashier') {
            $assignment = $this->staffAssignment?->load('canteen');
            return $assignment?->canteen;
        }
        return null;
    }
}
