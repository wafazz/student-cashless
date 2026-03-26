<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolFeeStudent extends Model
{
    protected $fillable = [
        'school_fee_id', 'student_id', 'school_id', 'amount_paid', 'status',
        'paid_at', 'payment_method', 'reference_id',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function fee()
    {
        return $this->belongsTo(SchoolFee::class, 'school_fee_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
