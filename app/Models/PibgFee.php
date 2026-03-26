<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PibgFee extends Model
{
    protected $fillable = [
        'school_id', 'name', 'amount', 'academic_year', 'due_date', 'description', 'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function parents()
    {
        return $this->hasMany(PibgFeeParent::class);
    }
}
