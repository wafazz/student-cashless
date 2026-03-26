<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolRegistration extends Model
{
    protected $fillable = [
        'school_name', 'address', 'school_phone',
        'contact_name', 'contact_email', 'contact_phone',
        'estimated_students', 'notes', 'status', 'admin_notes',
    ];
}
