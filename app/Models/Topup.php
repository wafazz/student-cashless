<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Topup extends Model
{
    protected $fillable = [
        'parent_id', 'student_id', 'amount', 'service_fee', 'payment_method',
        'gateway', 'gateway_ref', 'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'service_fee' => 'decimal:2',
    ];

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
