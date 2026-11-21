<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Settlement extends Model
{
    protected $guarded = ['id', 'created_at', 'updated_at', 'notified_on'];

    protected $hidden = ['notified_on'];

    protected function casts(): array
    {
        return ['amount' => 'float', 'closed' => 'boolean', 'date' => 'date:Y-m-d', 'due_date' => 'date:Y-m-d'];
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    protected static function booted(): void
    {
        static::saving(function (Settlement $s) {
            if ($s->isDirty('due_date')) {
                $s->notified_on = null;
            }
        });
    }
}
