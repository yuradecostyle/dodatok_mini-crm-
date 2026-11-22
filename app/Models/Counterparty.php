<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Counterparty extends Model
{
    public const TYPES = ['supplier', 'client', 'investor', 'other'];

    protected $guarded = ['id', 'created_at', 'updated_at'];

    /** Перейменування контрагента оновлює імʼя в усіх операціях і розрахунках. */
    protected static function booted(): void
    {
        static::updated(function (Counterparty $c) {
            if ($c->wasChanged('name')) {
                $old = $c->getOriginal('name');
                Transaction::where('counterparty', $old)->update(['counterparty' => $c->name]);
                Settlement::where('counterparty', $old)->update(['counterparty' => $c->name]);
            }
        });
    }
}
