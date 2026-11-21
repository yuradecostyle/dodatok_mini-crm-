<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    public const SOURCES = ['viber_personal', 'viber_work', 'telegram_personal', 'telegram_work'];
    public const STATUSES = ['new', 'work', 'offer', 'won', 'lost'];

    protected $guarded = ['id', 'created_at', 'updated_at', 'notified_on'];

    protected $hidden = ['notified_on'];

    protected function casts(): array
    {
        return ['amount' => 'float', 'date' => 'date:Y-m-d', 'next_date' => 'date:Y-m-d'];
    }

    protected static function booted(): void
    {
        static::saving(function (Lead $lead) {
            if ($lead->isDirty('next_date')) {
                $lead->notified_on = null;
            }
        });
    }
}
