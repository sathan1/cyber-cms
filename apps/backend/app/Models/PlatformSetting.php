<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PlatformSetting extends Model
{
    use HasFactory;

    protected $fillable = ['upi_id', 'bank_details'];
}
