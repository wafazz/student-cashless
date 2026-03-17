<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'canteen_id', 'name', 'price', 'category', 'is_available',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
    ];

    public function canteen()
    {
        return $this->belongsTo(Canteen::class);
    }
}
