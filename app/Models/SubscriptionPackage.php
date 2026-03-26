<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPackage extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'duration_days',
        'billing_cycle', 'features', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function schools()
    {
        return $this->hasMany(School::class, 'package_id');
    }
}
