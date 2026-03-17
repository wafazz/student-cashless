<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Canteen extends Model
{
    protected $fillable = [
        'school_id', 'operator_id', 'name', 'status',
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
}
