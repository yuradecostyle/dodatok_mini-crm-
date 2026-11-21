<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    public const SCOPES = ['production', 'home', 'personal'];
    public const KINDS = ['regular', 'supplier', 'client', 'investment', 'utility'];

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return [
            'amount' => 'float', 'date' => 'date:Y-m-d',
            'settlement_id' => 'integer', 'utility_id' => 'integer', 'project_id' => 'integer',
        ];
    }
}
