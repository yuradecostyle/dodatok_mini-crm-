<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    public const CHANNELS = ['viber', 'telegram', 'instagram', 'facebook', 'tiktok', 'google', 'site', 'olx', 'youtube', 'phone', 'referral', 'offline', 'other'];

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }
}
