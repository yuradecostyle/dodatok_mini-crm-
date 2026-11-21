<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Utility extends Model
{
    protected $guarded = ['id', 'created_at', 'updated_at', 'notified_on'];

    protected $hidden = ['notified_on'];

    protected function casts(): array
    {
        return [
            'meter_prev' => 'float', 'meter_curr' => 'float', 'tariff' => 'float', 'amount' => 'float',
            'paid' => 'boolean', 'due_date' => 'date:Y-m-d', 'paid_date' => 'date:Y-m-d',
        ];
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }

    /** Оплачена комуналка автоматично стає витратою «Дім → Комунальні». */
    protected static function booted(): void
    {
        static::saving(function (Utility $u) {
            if ($u->paid && ! $u->paid_date) {
                $u->paid_date = now()->toDateString();
            }
            if (! $u->paid) {
                $u->paid_date = null;
            }
            if ($u->isDirty('due_date')) {
                $u->notified_on = null;
            }
        });

        static::saved(function (Utility $u) {
            $tx = $u->transaction()->first();
            if ($u->paid && $u->amount > 0) {
                $data = [
                    'type' => 'expense', 'scope' => 'home', 'kind' => 'utility',
                    'category' => 'Комунальні', 'amount' => $u->amount,
                    'date' => $u->paid_date?->format('Y-m-d') ?? now()->toDateString(),
                    'note' => $u->service.' · '.$u->period,
                ];
                $tx ? $tx->update($data) : $u->transaction()->create($data);
            } elseif ($tx) {
                $tx->delete();
            }
        });
    }
}
