<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CanteenStaff extends Model
{
    protected $table = 'canteen_staff';

    protected $fillable = [
        'canteen_id', 'user_id', 'position', 'status',
    ];

    public function canteen()
    {
        return $this->belongsTo(Canteen::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
