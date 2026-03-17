<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $fillable = [
        'name', 'address', 'phone', 'logo', 'status',
    ];

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function canteens()
    {
        return $this->hasMany(Canteen::class);
    }
}
