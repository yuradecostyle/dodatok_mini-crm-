<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return ['due_date' => 'date:Y-m-d', 'lead_id' => 'integer'];
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
